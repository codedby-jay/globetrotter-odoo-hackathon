function toNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function isValidCoordinate(lat, lng) {
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);
  if (latitude == null || longitude == null) {
    return false;
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false;
  }
  if (latitude === 0 && longitude === 0) {
    return false;
  }
  return true;
}

export function cityCoordinates(city) {
  if (!city) {
    return null;
  }
  const lat = city.lat ?? city.latitude;
  const lng = city.lng ?? city.longitude;
  if (!isValidCoordinate(lat, lng)) {
    return null;
  }
  return { lat: toNumber(lat), lng: toNumber(lng) };
}

export function mapStopsFromTrip(trip) {
  const stops = [...(trip?.stops || [])].sort(
    (left, right) => (left.position ?? 0) - (right.position ?? 0),
  );
  const mappable = [];
  const skipped = [];

  stops.forEach((stop, index) => {
    const coords = cityCoordinates(stop.city);
    const order = index + 1;
    const item = {
      id: stop.id,
      order,
      position: stop.position ?? index,
      name: stop.city?.name || "Unknown city",
      country: stop.city?.country || "",
      region: stop.city?.region || "",
      startDate: stop.startDate,
      endDate: stop.endDate,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    };
    if (coords) {
      mappable.push(item);
    } else {
      skipped.push(item);
    }
  });

  return {
    all: stops,
    mappable,
    skipped,
    line: mappable.map((stop) => [stop.lat, stop.lng]),
  };
}

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
