import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { createShareSlug } from "../lib/shareSlug.js";
import { dateOnly, money, toDate, utcToday } from "../lib/dates.js";
import { serializeStop } from "../lib/serialize.js";

const SLUG_ATTEMPTS = 5;

function serializeTripSummary(trip) {
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    startDate: dateOnly(trip.startDate),
    endDate: dateOnly(trip.endDate),
    coverPhotoUrl: trip.coverPhotoUrl,
    budgetLimit: money(trip.budgetLimit),
    currency: trip.currency,
    visibility: trip.visibility,
    shareSlug: trip.shareSlug,
    destinationCount: trip._count?.stops ?? trip.stops?.length ?? 0,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}

function serializeTripDetail(trip) {
  return {
    ...serializeTripSummary(trip),
    stops: (trip.stops ?? []).map(serializeStop),
    expenses: (trip.expenses ?? []).map((expense) => ({
      id: expense.id,
      category: expense.category,
      label: expense.label,
      amount: money(expense.amount),
      incurredOn: dateOnly(expense.incurredOn),
      stopId: expense.stopId,
    })),
  };
}

const detailInclude = {
  _count: { select: { stops: true } },
  expenses: true,
  stops: {
    orderBy: { position: "asc" },
    include: {
      city: true,
      activities: {
        orderBy: [{ scheduledDate: "asc" }, { position: "asc" }],
        include: {
          activity: true,
        },
      },
    },
  },
};

export async function requireOwnedTrip(id, userId) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }

  if (trip.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  return trip;
}

async function uniqueShareSlug() {
  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
    const shareSlug = createShareSlug();
    const existing = await prisma.trip.findUnique({
      where: { shareSlug },
      select: { id: true },
    });
    if (!existing) {
      return shareSlug;
    }
  }

  throw new HttpError(409, "Could not generate a unique share link. Please try again.");
}

export async function listTrips(userId, status) {
  const today = utcToday();
  const where = { ownerId: userId };

  if (status === "upcoming") {
    where.endDate = { gte: today };
  } else if (status === "past") {
    where.endDate = { lt: today };
  }

  const trips = await prisma.trip.findMany({
    where,
    include: {
      _count: { select: { stops: true } },
    },
    orderBy: {
      startDate: status === "past" || !status ? "desc" : "asc",
    },
  });

  return trips.map(serializeTripSummary);
}

export async function createTrip(userId, input) {
  const shareSlug = await uniqueShareSlug();

  const trip = await prisma.trip.create({
    data: {
      ownerId: userId,
      name: input.name,
      description: input.description ?? null,
      startDate: toDate(input.startDate),
      endDate: toDate(input.endDate),
      coverPhotoUrl: input.coverPhotoUrl ?? null,
      budgetLimit: input.budgetLimit,
      currency: input.currency ?? "USD",
      visibility: "PRIVATE",
      shareSlug,
    },
    include: {
      _count: { select: { stops: true } },
    },
  });

  return serializeTripSummary(trip);
}

export async function getTrip(userId, tripId) {
  await requireOwnedTrip(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: detailInclude,
  });

  return serializeTripDetail(trip);
}

export async function updateTrip(userId, tripId, input) {
  const current = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (!current) {
    throw new HttpError(404, "Trip not found");
  }

  if (current.ownerId !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  const startDate = input.startDate ? toDate(input.startDate) : current.startDate;
  const endDate = input.endDate ? toDate(input.endDate) : current.endDate;

  if (endDate < startDate) {
    throw new HttpError(400, "End date cannot be before start date");
  }

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      name: input.name ?? undefined,
      description: input.description === undefined ? undefined : input.description,
      startDate: input.startDate ? startDate : undefined,
      endDate: input.endDate ? endDate : undefined,
      coverPhotoUrl:
        input.coverPhotoUrl === undefined ? undefined : input.coverPhotoUrl,
      budgetLimit: input.budgetLimit === undefined ? undefined : input.budgetLimit,
      currency: input.currency ?? undefined,
    },
    include: {
      _count: { select: { stops: true } },
    },
  });

  return serializeTripSummary(trip);
}

export async function deleteTrip(userId, tripId) {
  await requireOwnedTrip(tripId, userId);

  await prisma.trip.delete({
    where: { id: tripId },
  });

  return { message: "Trip deleted" };
}
