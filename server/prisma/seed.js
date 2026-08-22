import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { createShareSlug } from "../src/lib/shareSlug.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("GlobetrotterDemo1", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@globetrotter.dev" },
    update: {},
    create: {
      email: "demo@globetrotter.dev",
      passwordHash,
      name: "Demo Traveler",
      language: "en",
      role: "USER",
    },
  });

  const goa = await prisma.city.upsert({
    where: { externalId: "demo:in:goa" },
    update: {},
    create: {
      externalId: "demo:in:goa",
      name: "Goa",
      country: "India",
      countryCode: "IN",
      region: "West India",
      latitude: 15.4909,
      longitude: 73.8278,
      costIndex: 62,
      popularity: 12,
    },
  });

  const jaipur = await prisma.city.upsert({
    where: { externalId: "demo:in:jaipur" },
    update: {},
    create: {
      externalId: "demo:in:jaipur",
      name: "Jaipur",
      country: "India",
      countryCode: "IN",
      region: "Rajasthan",
      latitude: 26.9124,
      longitude: 75.7873,
      costIndex: 48,
      popularity: 9,
    },
  });

  const fortAguada = await prisma.activity.upsert({
    where: { externalId: "demo:goa:fort-aguada" },
    update: {},
    create: {
      externalId: "demo:goa:fort-aguada",
      cityId: goa.id,
      name: "Fort Aguada",
      type: "SIGHTSEEING",
      description: "17th-century Portuguese fort overlooking the Arabian Sea.",
      durationMin: 90,
      typicalCost: 20,
    },
  });

  const panajiFood = await prisma.activity.upsert({
    where: { externalId: "demo:goa:panaji-food-walk" },
    update: {},
    create: {
      externalId: "demo:goa:panaji-food-walk",
      cityId: goa.id,
      name: "Panaji food walk",
      type: "FOOD",
      description: "Evening walk through Fontainhas with Goan snacks.",
      durationMin: 120,
      typicalCost: 35,
    },
  });

  const amberFort = await prisma.activity.upsert({
    where: { externalId: "demo:jaipur:amber-fort" },
    update: {},
    create: {
      externalId: "demo:jaipur:amber-fort",
      cityId: jaipur.id,
      name: "Amber Fort",
      type: "CULTURE",
      description: "Hilltop fort and palace complex outside Jaipur.",
      durationMin: 180,
      typicalCost: 40,
    },
  });

  const existingTrip = await prisma.trip.findFirst({
    where: { ownerId: user.id, name: "West India long weekend" },
  });

  if (existingTrip) {
    console.log("Demo trip already exists; skipping trip graph seed.");
    return;
  }

  const trip = await prisma.trip.create({
    data: {
      ownerId: user.id,
      name: "West India long weekend",
      description: "Goa beaches, then a short hop to Jaipur.",
      startDate: new Date("2026-09-18"),
      endDate: new Date("2026-09-22"),
      budgetLimit: 1200,
      currency: "USD",
      visibility: "PRIVATE",
      shareSlug: `demo-${createShareSlug()}`,
    },
  });

  const goaStop = await prisma.stop.create({
    data: {
      tripId: trip.id,
      cityId: goa.id,
      position: 0,
      startDate: new Date("2026-09-18"),
      endDate: new Date("2026-09-20"),
      stayCost: 180,
      transportCost: 95,
      notes: "Stay near Calangute.",
    },
  });

  const jaipurStop = await prisma.stop.create({
    data: {
      tripId: trip.id,
      cityId: jaipur.id,
      position: 1,
      startDate: new Date("2026-09-20"),
      endDate: new Date("2026-09-22"),
      stayCost: 140,
      transportCost: 110,
    },
  });

  await prisma.stopActivity.createMany({
    data: [
      {
        stopId: goaStop.id,
        activityId: fortAguada.id,
        scheduledDate: new Date("2026-09-18"),
        startTime: new Date("1970-01-01T10:00:00Z"),
        durationMin: 90,
        cost: 20,
        costCategory: "ACTIVITY",
        position: 0,
      },
      {
        stopId: goaStop.id,
        activityId: panajiFood.id,
        scheduledDate: new Date("2026-09-18"),
        startTime: new Date("1970-01-01T18:00:00Z"),
        durationMin: 120,
        cost: 35,
        costCategory: "MEALS",
        position: 1,
      },
      {
        stopId: jaipurStop.id,
        activityId: amberFort.id,
        scheduledDate: new Date("2026-09-21"),
        startTime: new Date("1970-01-01T09:00:00Z"),
        durationMin: 180,
        cost: 40,
        costCategory: "ACTIVITY",
        position: 0,
      },
    ],
  });

  await prisma.tripExpense.createMany({
    data: [
      {
        tripId: trip.id,
        category: "TRANSPORT",
        label: "Domestic flight add-on",
        amount: 85,
        incurredOn: new Date("2026-09-20"),
      },
      {
        tripId: trip.id,
        stopId: jaipurStop.id,
        category: "OTHER",
        label: "Travel insurance",
        amount: 25,
        incurredOn: new Date("2026-09-18"),
      },
    ],
  });

  await prisma.savedDestination.create({
    data: {
      userId: user.id,
      cityId: goa.id,
    },
  });

  console.log("Seeded demo user, two cities, one trip, stops, activities, and expenses.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
