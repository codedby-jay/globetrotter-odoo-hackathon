import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { dateOnly, toDate } from "../lib/dates.js";
import { serializeStop } from "../lib/serialize.js";
import { requireOwnedTrip } from "./tripService.js";

const stopInclude = {
  city: true,
  activities: {
    orderBy: [{ scheduledDate: "asc" }, { position: "asc" }],
    include: { activity: { include: { city: true } } },
  },
};

function assertStopWithinTrip(trip, startDate, endDate) {
  const tripStart = dateOnly(trip.startDate);
  const tripEnd = dateOnly(trip.endDate);
  const stopStart = dateOnly(startDate);
  const stopEnd = dateOnly(endDate);

  if (stopEnd < stopStart) {
    throw new HttpError(400, "Stop end date cannot be before start date");
  }
  if (stopStart < tripStart || stopEnd > tripEnd) {
    throw new HttpError(400, "Stop dates must fall inside the trip dates");
  }
}

export async function getOwnedStop(stopId, userId) {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: {
      trip: true,
      city: true,
    },
  });

  if (!stop) {
    throw new HttpError(404, "Stop not found");
  }

  if (stop.trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  return stop;
}

async function normalizePositions(tx, tripId) {
  const remaining = await tx.stop.findMany({
    where: { tripId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  await Promise.all(
    remaining.map((stop, index) =>
      tx.stop.update({
        where: { id: stop.id },
        data: { position: index },
      }),
    ),
  );
}

export async function createStop(userId, tripId, input) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }
  if (trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  const city = await prisma.city.findUnique({
    where: { id: input.cityId },
  });
  if (!city) {
    throw new HttpError(400, "City not found");
  }

  const startDate = toDate(input.startDate);
  const endDate = toDate(input.endDate);
  assertStopWithinTrip(trip, startDate, endDate);

  const created = await prisma.$transaction(async (tx) => {
    const count = await tx.stop.count({ where: { tripId } });
    const stop = await tx.stop.create({
      data: {
        tripId,
        cityId: input.cityId,
        position: count,
        startDate,
        endDate,
        notes: input.notes ?? null,
        stayCost: 0,
        transportCost: 0,
      },
      include: stopInclude,
    });

    await tx.city.update({
      where: { id: input.cityId },
      data: { popularity: { increment: 1 } },
    });

    return stop;
  });

  return serializeStop(created);
}

export async function updateStop(userId, stopId, input) {
  const current = await getOwnedStop(stopId, userId);

  if (input.cityId) {
    const city = await prisma.city.findUnique({ where: { id: input.cityId } });
    if (!city) {
      throw new HttpError(400, "City not found");
    }
  }

  const startDate = input.startDate ? toDate(input.startDate) : current.startDate;
  const endDate = input.endDate ? toDate(input.endDate) : current.endDate;
  assertStopWithinTrip(current.trip, startDate, endDate);

  const stop = await prisma.stop.update({
    where: { id: stopId },
    data: {
      cityId: input.cityId ?? undefined,
      startDate: input.startDate ? startDate : undefined,
      endDate: input.endDate ? endDate : undefined,
      notes: input.notes === undefined ? undefined : input.notes,
      stayCost: input.stayCost === undefined ? undefined : input.stayCost,
      transportCost: input.transportCost === undefined ? undefined : input.transportCost,
    },
    include: stopInclude,
  });

  return serializeStop(stop);
}

export async function deleteStop(userId, stopId) {
  const current = await getOwnedStop(stopId, userId);

  await prisma.$transaction(async (tx) => {
    await tx.stop.delete({ where: { id: stopId } });
    await normalizePositions(tx, current.tripId);
  });

  return { message: "Stop deleted" };
}

export async function reorderStops(userId, tripId, stopIds) {
  await requireOwnedTrip(tripId, userId);

  const uniqueIds = new Set(stopIds);
  if (uniqueIds.size !== stopIds.length) {
    throw new HttpError(400, "Reorder list contains duplicate stops");
  }

  const existing = await prisma.stop.findMany({
    where: { tripId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((stop) => stop.id));

  if (existing.length !== stopIds.length || stopIds.some((id) => !existingIds.has(id))) {
    throw new HttpError(400, "Reorder list must include every stop in this trip exactly once");
  }

  const stops = await prisma.$transaction(async (tx) => {
    await Promise.all(
      stopIds.map((id, index) =>
        tx.stop.update({
          where: { id },
          data: { position: index + 1000 },
        }),
      ),
    );
    await Promise.all(
      stopIds.map((id, index) =>
        tx.stop.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );

    return tx.stop.findMany({
      where: { tripId },
      orderBy: { position: "asc" },
      include: stopInclude,
    });
  });

  return stops.map(serializeStop);
}
