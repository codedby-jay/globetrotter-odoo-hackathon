import { dateOnly, money } from "./dates.js";

export function serializeCity(city) {
  if (!city) {
    return null;
  }
  return {
    id: city.id,
    externalId: city.externalId,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    region: city.region,
    lat: city.latitude,
    lng: city.longitude,
    imageUrl: city.imageUrl,
    costIndex: money(city.costIndex) ?? 50,
    popularity: city.popularity,
  };
}

export function serializeStop(stop) {
  return {
    id: stop.id,
    tripId: stop.tripId,
    position: stop.position,
    startDate: dateOnly(stop.startDate),
    endDate: dateOnly(stop.endDate),
    notes: stop.notes,
    stayCost: money(stop.stayCost) ?? 0,
    transportCost: money(stop.transportCost) ?? 0,
    city: serializeCity(stop.city),
    activities: (stop.activities ?? []).map((item) => ({
      id: item.id,
      scheduledDate: dateOnly(item.scheduledDate),
      startTime: item.startTime,
      durationMin: item.durationMin,
      cost: money(item.cost),
      costCategory: item.costCategory,
      position: item.position,
      notes: item.notes,
      customName: item.customName,
      customDescription: item.customDescription,
      activity: item.activity
        ? {
            id: item.activity.id,
            name: item.activity.name,
            type: item.activity.type,
            imageUrl: item.activity.imageUrl,
            durationMin: item.activity.durationMin,
            typicalCost: money(item.activity.typicalCost),
          }
        : null,
    })),
  };
}
