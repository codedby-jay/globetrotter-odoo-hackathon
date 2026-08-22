function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildCatalogTemplates(city) {
  return [
    {
      slug: "city-walk",
      name: `${city.name} walking tour`,
      type: "SIGHTSEEING",
      description: `A self-paced walk past the best-known streets and landmarks in ${city.name}.`,
      durationMin: 120,
      typicalCost: 0,
      popularity: 10,
    },
    {
      slug: "local-food",
      name: `Local food in ${city.name}`,
      type: "FOOD",
      description: `Taste regional dishes and street snacks that locals recommend in ${city.name}.`,
      durationMin: 90,
      typicalCost: 25,
      popularity: 9,
    },
    {
      slug: "museum",
      name: `${city.name} museum afternoon`,
      type: "CULTURE",
      description: `Spend a few hours with the city's art, history, or heritage collections.`,
      durationMin: 150,
      typicalCost: 15,
      popularity: 7,
    },
    {
      slug: "viewpoint",
      name: `${city.name} viewpoint`,
      type: "NATURE",
      description: `Catch a sunset or skyline view from a popular lookout near ${city.name}.`,
      durationMin: 60,
      typicalCost: 0,
      popularity: 8,
    },
    {
      slug: "market",
      name: `${city.name} market stroll`,
      type: "SHOPPING",
      description: `Browse a local market for souvenirs, spices, and everyday city life.`,
      durationMin: 75,
      typicalCost: 20,
      popularity: 6,
    },
    {
      slug: "adventure",
      name: `Outdoor adventure near ${city.name}`,
      type: "ADVENTURE",
      description: `A short active outing—hike, cycle, or water activity depending on the season.`,
      durationMin: 180,
      typicalCost: 40,
      popularity: 5,
    },
  ];
}

export function catalogExternalId(city, slug) {
  return `catalog:${city.externalId}:${slug || slugify(city.name)}`;
}
