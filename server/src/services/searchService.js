import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { serializeCity } from "../lib/serialize.js";
import { searchNominatim } from "../providers/nominatim.js";

async function upsertCity(normalized) {
  return prisma.city.upsert({
    where: { externalId: normalized.externalId },
    create: {
      externalId: normalized.externalId,
      name: normalized.name,
      country: normalized.country,
      countryCode: normalized.countryCode,
      region: normalized.region,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      costIndex: 50,
      popularity: 0,
    },
    update: {
      name: normalized.name,
      country: normalized.country,
      countryCode: normalized.countryCode,
      region: normalized.region,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
    },
  });
}

function matchesFilters(city, filters) {
  if (filters.country && city.country.toLowerCase() !== filters.country.toLowerCase()) {
    return false;
  }
  if (
    filters.region &&
    !(city.region || "").toLowerCase().includes(filters.region.toLowerCase())
  ) {
    return false;
  }
  const cost = Number(city.costIndex);
  if (filters.minCostIndex != null && cost < filters.minCostIndex) {
    return false;
  }
  if (filters.maxCostIndex != null && cost > filters.maxCostIndex) {
    return false;
  }
  return true;
}

function sortCities(cities, sort) {
  const copy = [...cities];
  if (sort === "popularity") {
    copy.sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
  } else if (sort === "cost") {
    copy.sort((a, b) => Number(a.costIndex) - Number(b.costIndex) || a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy;
}

export async function searchCities(filters) {
  const query = filters.q.trim();
  const cached = await prisma.city.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
        { region: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 20,
  });

  let live = [];
  let providerFailed = false;

  try {
    live = await searchNominatim(query);
  } catch (error) {
    providerFailed = true;
    console.error("Nominatim search failed:", error.message);
  }

  const upserted = [];
  for (const place of live) {
    upserted.push(await upsertCity(place));
  }

  const merged = new Map();
  for (const city of [...cached, ...upserted]) {
    merged.set(city.id, city);
  }

  let results = sortCities(
    [...merged.values()].filter((city) => matchesFilters(city, filters)),
    filters.sort,
  ).slice(0, 10);

  if (results.length === 0 && providerFailed) {
    throw new HttpError(
      503,
      "City search is temporarily unavailable. Please try again shortly.",
    );
  }

  return results.map(serializeCity);
}
