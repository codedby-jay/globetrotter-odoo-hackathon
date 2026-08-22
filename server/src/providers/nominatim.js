const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "GlobeTrotter/1.0 (Odoo x LDCE Ahmedabad Hackathon; https://github.com/codedby-jay/globetrotter-odoo-hackathon)";

let lastRequestAt = 0;

async function waitForRateLimit() {
  const waitMs = 1100 - (Date.now() - lastRequestAt);
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastRequestAt = Date.now();
}

function isCityLike(place) {
  const type = place.type || "";
  const address = place.address || {};
  return Boolean(
    ["city", "town", "village", "municipality", "hamlet", "suburb", "county"].includes(type) ||
      address.city ||
      address.town ||
      address.village ||
      address.municipality,
  );
}

export function normalizeNominatimPlace(place) {
  const address = place.address || {};
  const name =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    place.name ||
    place.display_name?.split(",")[0]?.trim();

  if (!name || place.place_id == null) {
    return null;
  }

  return {
    externalId: String(place.place_id),
    name,
    country: address.country || "Unknown",
    countryCode: (address.country_code || "").toUpperCase() || "XX",
    region: address.state || address.region || address.county || null,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
  };
}

export async function searchNominatim(query) {
  await waitForRateLimit();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "10");
  url.searchParams.set("accept-language", "en");

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      "Accept-Language": "en",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const error = new Error(`Nominatim request failed (${response.status})`);
    error.status = 503;
    throw error;
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter(isCityLike)
    .map(normalizeNominatimPlace)
    .filter(Boolean);
}
