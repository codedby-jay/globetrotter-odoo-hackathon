import { prisma } from "../lib/prisma.js";
import { buildCatalogTemplates, catalogExternalId } from "./activityCatalog.js";

export async function ensureCityActivityCatalog(city) {
  const templates = buildCatalogTemplates(city);
  const upserted = [];

  for (const template of templates) {
    const activity = await prisma.activity.upsert({
      where: { externalId: catalogExternalId(city, template.slug) },
      create: {
        externalId: catalogExternalId(city, template.slug),
        cityId: city.id,
        name: template.name,
        type: template.type,
        description: template.description,
        durationMin: template.durationMin,
        typicalCost: template.typicalCost,
        latitude: city.latitude,
        longitude: city.longitude,
        popularity: template.popularity,
      },
      update: {
        cityId: city.id,
        name: template.name,
        type: template.type,
        description: template.description,
        durationMin: template.durationMin,
        typicalCost: template.typicalCost,
        latitude: city.latitude,
        longitude: city.longitude,
      },
      include: { city: true },
    });
    upserted.push(activity);
  }

  return upserted;
}

export async function searchCityActivities(city, query) {
  await ensureCityActivityCatalog(city);

  const where = {
    cityId: city.id,
  };

  const trimmed = query?.trim();
  if (trimmed) {
    const typeMatch = trimmed.toUpperCase();
    const types = [
      "SIGHTSEEING",
      "FOOD",
      "NATURE",
      "CULTURE",
      "ADVENTURE",
      "SHOPPING",
      "NIGHTLIFE",
      "OTHER",
    ];
    where.OR = [
      { name: { contains: trimmed, mode: "insensitive" } },
      { description: { contains: trimmed, mode: "insensitive" } },
      ...(types.includes(typeMatch) ? [{ type: { equals: typeMatch } }] : []),
    ];
  }

  return prisma.activity.findMany({
    where,
    include: { city: true },
    orderBy: [{ popularity: "desc" }, { name: "asc" }],
    take: 20,
  });
}
