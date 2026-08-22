import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import {
  clockToMinutes,
  dateOnly,
  parseClock,
  toDate,
} from "../lib/dates.js";
import { serializeActivity, serializeStopActivity } from "../lib/serialize.js";
import { searchCityActivities } from "../providers/activitySearch.js";
import { getOwnedStop } from "./stopService.js";

const stopActivityInclude = {
  activity: { include: { city: true } },
};

function assertScheduledDateInStop(stop, scheduledDate) {
  const date = dateOnly(scheduledDate);
  const start = dateOnly(stop.startDate);
  const end = dateOnly(stop.endDate);
  if (!date || date < start || date > end) {
    throw new HttpError(400, "Scheduled date must fall inside the destination dates");
  }
}

function resolveTiming(input, fallbackDuration) {
  const startTime = parseClock(input.startTime);
  const endTime = parseClock(input.endTime);
  let durationMin =
    input.durationMin === undefined || input.durationMin === null
      ? fallbackDuration
      : input.durationMin;

  if (input.startTime && !startTime) {
    throw new HttpError(400, "Start time must be a valid time");
  }
  if (input.endTime && !endTime) {
    throw new HttpError(400, "End time must be a valid time");
  }

  if (startTime && endTime) {
    const startMinutes = clockToMinutes(startTime);
    const endMinutes = clockToMinutes(endTime);
    if (endMinutes <= startMinutes) {
      throw new HttpError(400, "End time must be after start time");
    }
    durationMin = endMinutes - startMinutes;
  }

  if (durationMin != null && durationMin < 0) {
    throw new HttpError(400, "Duration cannot be negative");
  }

  return { startTime, durationMin };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "activity";
}

async function upsertCatalogActivity(stop, payload) {
  const externalId =
    payload.externalId?.trim() ||
    `catalog:${stop.city.externalId}:${slugify(payload.name)}`;

  const existing = await prisma.activity.findUnique({
    where: { externalId },
    include: { city: true },
  });

  const data = {
    name: payload.name.trim(),
    type: payload.type || existing?.type || "OTHER",
    description:
      payload.description === undefined
        ? existing?.description
        : payload.description,
    imageUrl: payload.imageUrl === undefined ? existing?.imageUrl : payload.imageUrl,
    durationMin:
      payload.durationMin === undefined ? existing?.durationMin : payload.durationMin,
    typicalCost:
      payload.typicalCost === undefined
        ? (existing?.typicalCost ?? 0)
        : payload.typicalCost,
    latitude:
      payload.latitude === undefined
        ? (existing?.latitude ?? stop.city.latitude)
        : payload.latitude,
    longitude:
      payload.longitude === undefined
        ? (existing?.longitude ?? stop.city.longitude)
        : payload.longitude,
    cityId: existing?.cityId ?? stop.cityId,
  };

  if (existing) {
    return prisma.activity.update({
      where: { id: existing.id },
      data,
      include: { city: true },
    });
  }

  return prisma.activity.create({
    data: {
      externalId,
      ...data,
    },
    include: { city: true },
  });
}

function assertActivityCity(stop, activity) {
  if (activity?.cityId && activity.cityId !== stop.cityId) {
    throw new HttpError(400, "Activity must belong to the same city as this destination");
  }
}

async function loadActivityForStop(stop, input) {
  if (input.activityId) {
    const activity = await prisma.activity.findUnique({
      where: { id: input.activityId },
      include: { city: true },
    });
    if (!activity) {
      throw new HttpError(404, "Activity not found");
    }
    assertActivityCity(stop, activity);
    return activity;
  }

  if (input.activity?.name) {
    const activity = await upsertCatalogActivity(stop, input.activity);
    assertActivityCity(stop, activity);
    return activity;
  }

  return null;
}

export async function searchActivities({ cityId, q }) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
  });
  if (!city) {
    throw new HttpError(404, "City not found");
  }

  const results = await searchCityActivities(city, q);
  return results.map(serializeActivity);
}

export async function listStopActivities(userId, stopId) {
  await getOwnedStop(stopId, userId);
  const activities = await prisma.stopActivity.findMany({
    where: { stopId },
    orderBy: [{ scheduledDate: "asc" }, { position: "asc" }],
    include: stopActivityInclude,
  });
  return activities.map(serializeStopActivity);
}

export async function createStopActivity(userId, stopId, input) {
  const stop = await getOwnedStop(stopId, userId);
  assertScheduledDateInStop(stop, input.scheduledDate);

  const activity = await loadActivityForStop(stop, input);
  if (!activity && !input.customName) {
    throw new HttpError(400, "Select an activity");
  }

  const timing = resolveTiming(input, activity?.durationMin ?? null);
  const nextPosition =
    input.position ??
    (await prisma.stopActivity.count({ where: { stopId } }));

  if (nextPosition < 0) {
    throw new HttpError(400, "Position cannot be negative");
  }

  const created = await prisma.stopActivity.create({
    data: {
      stopId,
      activityId: activity?.id ?? null,
      customName: input.customName ?? null,
      customDescription: input.customDescription ?? null,
      scheduledDate: toDate(input.scheduledDate),
      startTime: timing.startTime,
      durationMin: timing.durationMin,
      cost: input.cost ?? activity?.typicalCost ?? 0,
      notes: input.notes ?? null,
      position: nextPosition,
    },
    include: stopActivityInclude,
  });

  if (activity) {
    await prisma.activity.update({
      where: { id: activity.id },
      data: { popularity: { increment: 1 } },
    });
  }

  return serializeStopActivity(created);
}

export async function updateStopActivity(userId, id, input) {
  const current = await prisma.stopActivity.findUnique({
    where: { id },
    include: {
      stop: { include: { trip: true, city: true } },
      activity: { include: { city: true } },
    },
  });

  if (!current) {
    throw new HttpError(404, "Activity not found");
  }
  if (current.stop.trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  const scheduledDate = input.scheduledDate
    ? toDate(input.scheduledDate)
    : current.scheduledDate;
  assertScheduledDateInStop(current.stop, scheduledDate);

  let activity = current.activity;
  if (input.activityId || input.activity) {
    activity = await loadActivityForStop(current.stop, input);
  }

  const timing = resolveTiming(
    {
      startTime: input.startTime === undefined ? current.startTime : input.startTime,
      endTime: input.endTime,
      durationMin:
        input.durationMin === undefined && input.endTime === undefined
          ? current.durationMin
          : input.durationMin,
    },
    activity?.durationMin ?? current.durationMin,
  );

  if (input.position != null && input.position < 0) {
    throw new HttpError(400, "Position cannot be negative");
  }

  const updated = await prisma.stopActivity.update({
    where: { id },
    data: {
      activityId: activity?.id ?? current.activityId,
      customName: input.customName === undefined ? undefined : input.customName,
      customDescription:
        input.customDescription === undefined ? undefined : input.customDescription,
      scheduledDate: input.scheduledDate ? scheduledDate : undefined,
      startTime: input.startTime === undefined && input.endTime === undefined
        ? undefined
        : timing.startTime,
      durationMin:
        input.durationMin === undefined && input.endTime === undefined
          ? undefined
          : timing.durationMin,
      cost: input.cost === undefined ? undefined : input.cost,
      notes: input.notes === undefined ? undefined : input.notes,
      position: input.position,
    },
    include: stopActivityInclude,
  });

  return serializeStopActivity(updated);
}

export async function deleteStopActivity(userId, id) {
  const current = await prisma.stopActivity.findUnique({
    where: { id },
    include: { stop: { include: { trip: true } } },
  });

  if (!current) {
    throw new HttpError(404, "Activity not found");
  }
  if (current.stop.trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  await prisma.$transaction(async (tx) => {
    await tx.stopActivity.delete({ where: { id } });
    const remaining = await tx.stopActivity.findMany({
      where: { stopId: current.stopId },
      orderBy: [{ scheduledDate: "asc" }, { position: "asc" }],
      select: { id: true },
    });
    await Promise.all(
      remaining.map((item, index) =>
        tx.stopActivity.update({
          where: { id: item.id },
          data: { position: index },
        }),
      ),
    );
  });

  return { message: "Activity deleted" };
}

export async function reorderStopActivities(userId, stopId, stopActivityIds) {
  await getOwnedStop(stopId, userId);

  const uniqueIds = new Set(stopActivityIds);
  if (uniqueIds.size !== stopActivityIds.length) {
    throw new HttpError(400, "Reorder list contains duplicate activities");
  }

  const existing = await prisma.stopActivity.findMany({
    where: { stopId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((item) => item.id));

  if (
    existing.length !== stopActivityIds.length ||
    stopActivityIds.some((id) => !existingIds.has(id))
  ) {
    throw new HttpError(
      400,
      "Reorder list must include every activity in this destination exactly once",
    );
  }

  const activities = await prisma.$transaction(async (tx) => {
    await Promise.all(
      stopActivityIds.map((id, index) =>
        tx.stopActivity.update({
          where: { id },
          data: { position: index + 1000 },
        }),
      ),
    );
    await Promise.all(
      stopActivityIds.map((id, index) =>
        tx.stopActivity.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );

    return tx.stopActivity.findMany({
      where: { stopId },
      orderBy: { position: "asc" },
      include: stopActivityInclude,
    });
  });

  return activities.map(serializeStopActivity);
}
