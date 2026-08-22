import { addMinutesToClock, dateOnly, formatClock, money } from "./dates.js";

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
    activities: (stop.activities ?? []).map(serializeStopActivity),
  };
}

export function serializeActivity(activity) {
  if (!activity) {
    return null;
  }
  return {
    id: activity.id,
    externalId: activity.externalId,
    name: activity.name,
    description: activity.description,
    type: activity.type,
    cityId: activity.cityId,
    city: activity.city ? serializeCity(activity.city) : null,
    lat: activity.latitude,
    lng: activity.longitude,
    typicalCost: money(activity.typicalCost) ?? 0,
    durationMin: activity.durationMin,
    imageUrl: activity.imageUrl,
    popularity: activity.popularity,
  };
}

export function serializeExpense(expense, currency) {
  const expenseDate = dateOnly(expense.incurredOn);
  return {
    id: expense.id,
    tripId: expense.tripId,
    stopId: expense.stopId,
    category: expense.category,
    description: expense.label,
    label: expense.label,
    amount: money(expense.amount) ?? 0,
    currency,
    expenseDate,
    incurredOn: expenseDate,
  };
}

export function serializeStopActivity(item) {
  const startTime = formatClock(item.startTime);
  const durationMin = item.durationMin ?? item.activity?.durationMin ?? null;
  return {
    id: item.id,
    stopId: item.stopId,
    activityId: item.activityId,
    scheduledDate: dateOnly(item.scheduledDate),
    startTime,
    endTime: addMinutesToClock(startTime, durationMin),
    durationMin,
    cost: money(item.cost) ?? 0,
    costCategory: item.costCategory,
    position: item.position,
    notes: item.notes,
    customName: item.customName,
    customDescription: item.customDescription,
    activity: serializeActivity(item.activity),
  };
}

export function serializePublicCity(city) {
  if (!city) {
    return null;
  }
  return {
    name: city.name,
    country: city.country,
    region: city.region || null,
  };
}

export function serializePublicActivity(item) {
  const startTime = formatClock(item.startTime);
  const durationMin = item.durationMin ?? item.activity?.durationMin ?? null;
  return {
    name: item.customName || item.activity?.name || "Activity",
    description: item.customDescription || item.activity?.description || item.notes || null,
    category: item.activity?.type || item.costCategory || "OTHER",
    scheduledDate: dateOnly(item.scheduledDate),
    startTime,
    endTime: addMinutesToClock(startTime, durationMin),
    durationMin,
    cost: money(item.cost) ?? 0,
    notes: item.notes,
    position: item.position,
  };
}

export function serializePublicStop(stop) {
  return {
    position: stop.position,
    startDate: dateOnly(stop.startDate),
    endDate: dateOnly(stop.endDate),
    notes: stop.notes,
    city: serializePublicCity(stop.city),
    activities: (stop.activities ?? []).map(serializePublicActivity),
  };
}

export function serializePublicTrip(trip) {
  return {
    name: trip.name,
    description: trip.description,
    startDate: dateOnly(trip.startDate),
    endDate: dateOnly(trip.endDate),
    coverPhotoUrl: trip.coverPhotoUrl,
    currency: trip.currency,
    visibility: trip.visibility,
    shareSlug: trip.shareSlug,
    stops: (trip.stops ?? []).map(serializePublicStop),
  };
}
