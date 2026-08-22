import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { serializePublicTrip } from "../lib/serialize.js";
import { getTrip, uniqueShareSlug } from "./tripService.js";

const publicInclude = {
  stops: {
    orderBy: { position: "asc" },
    include: {
      city: true,
      activities: {
        orderBy: [{ scheduledDate: "asc" }, { position: "asc" }],
        include: { activity: true },
      },
    },
  },
};

const cloneInclude = {
  expenses: true,
  stops: {
    orderBy: { position: "asc" },
    include: {
      activities: {
        orderBy: [{ scheduledDate: "asc" }, { position: "asc" }],
      },
    },
  },
};

export async function recordShareEvent(tripId, event) {
  try {
    await prisma.shareEvent.create({
      data: { tripId, event },
    });
  } catch (error) {
    console.error("ShareEvent logging failed:", error.message);
  }
}

export async function getPublicTrip(slug) {
  const trip = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: publicInclude,
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }

  if (trip.visibility === "PRIVATE") {
    throw new HttpError(404, "This trip is private.");
  }

  recordShareEvent(trip.id, "VIEW");
  return serializePublicTrip(trip);
}

export async function copyPublicTrip(userId, slug) {
  const source = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: cloneInclude,
  });

  if (!source) {
    throw new HttpError(404, "Trip not found");
  }

  if (source.visibility === "PRIVATE") {
    throw new HttpError(404, "This trip is private.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const shareSlug = await uniqueShareSlug(tx);
    const trip = await tx.trip.create({
      data: {
        ownerId: userId,
        name: source.name,
        description: source.description,
        startDate: source.startDate,
        endDate: source.endDate,
        coverPhotoUrl: source.coverPhotoUrl,
        budgetLimit: source.budgetLimit,
        currency: source.currency,
        visibility: "PRIVATE",
        shareSlug,
        copiedFromId: source.id,
      },
    });

    const stopIdMap = new Map();
    for (const stop of source.stops) {
      const createdStop = await tx.stop.create({
        data: {
          tripId: trip.id,
          cityId: stop.cityId,
          position: stop.position,
          startDate: stop.startDate,
          endDate: stop.endDate,
          notes: stop.notes,
          stayCost: stop.stayCost,
          transportCost: stop.transportCost,
          activities: {
            create: stop.activities.map((item) => ({
              activityId: item.activityId,
              customName: item.customName,
              customDescription: item.customDescription,
              scheduledDate: item.scheduledDate,
              startTime: item.startTime,
              durationMin: item.durationMin,
              cost: item.cost,
              costCategory: item.costCategory,
              position: item.position,
              notes: item.notes,
            })),
          },
        },
      });
      stopIdMap.set(stop.id, createdStop.id);
    }

    if (source.expenses.length > 0) {
      await tx.tripExpense.createMany({
        data: source.expenses.map((expense) => ({
          tripId: trip.id,
          stopId: expense.stopId ? stopIdMap.get(expense.stopId) || null : null,
          category: expense.category,
          label: expense.label,
          amount: expense.amount,
          incurredOn: expense.incurredOn,
        })),
      });
    }

    return trip;
  });

  recordShareEvent(source.id, "COPY");
  const trip = await getTrip(userId, created.id);
  return {
    ...trip,
    ownerId: userId,
  };
}
