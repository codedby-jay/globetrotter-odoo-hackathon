const unsplash = (id, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const TRAVEL_PHOTOS = {
  flight: unsplash("photo-1436491865332-7a61a109cc05"),
  cabin: unsplash("photo-1542296332-2e4473faf883"),
  wing: unsplash("photo-1464037866556-6812c9d1c72e"),
  airport: unsplash("photo-1570710891163-6d3b5c47248b"),
  mountains: unsplash("photo-1464822759023-fed622ff2c3b"),
  beach: unsplash("photo-1507525428034-b723cf961d3e"),
  city: unsplash("photo-1480714378408-67cf0d13bc1b"),
  delhi: unsplash("photo-1587474260584-136574528ed5"),
  india: unsplash("photo-1524492412937-b28074fb89c0"),
  mumbai: unsplash("photo-1566552881560-0be862a7c445"),
  goa: unsplash("photo-1512343879784-a960cd61ef2a"),
  jaipur: unsplash("photo-1477587458883-47145f673ee4"),
  kerala: unsplash("photo-1602216056096-3b40cc0c9944"),
  thailand: unsplash("photo-1552465011-b4e21bf6e79a"),
  bali: unsplash("photo-1537996194471-e657df975ab4"),
  dubai: unsplash("photo-1512453979798-5ea266f8880c"),
  paris: unsplash("photo-1502602898657-3e91760cbb34"),
  london: unsplash("photo-1513635269975-59663e0ac1ad"),
  tokyo: unsplash("photo-1540959733332-eab4deabeeaf"),
  nyc: unsplash("photo-1496442226666-8d4d0e62e6e9"),
  rome: unsplash("photo-1552832230-c0197dd311b5"),
  barcelona: unsplash("photo-1583422409516-2895a77efded"),
  singapore: unsplash("photo-1525625293386-3f8f99389edd"),
  sydney: unsplash("photo-1506973035872-a4ec16b8e8d9"),
  switzerland: unsplash("photo-1531366936337-7c912a4589a7"),
};

const KEYWORDS = [
  { keys: ["thailand", "thiland", "bangkok", "phuket", "chiang", "pattaya"], photo: "thailand" },
  { keys: ["delhi", "new delhi", "india gate"], photo: "delhi" },
  { keys: ["mumbai", "bombay"], photo: "mumbai" },
  { keys: ["goa", "calangute"], photo: "goa" },
  { keys: ["jaipur", "rajasthan", "udaipur"], photo: "jaipur" },
  { keys: ["kerala", "kochi", "alleppey", "munnar"], photo: "kerala" },
  { keys: ["taj", "agra", "india"], photo: "india" },
  { keys: ["bali", "ubud", "indonesia"], photo: "bali" },
  { keys: ["dubai", "uae", "abu dhabi"], photo: "dubai" },
  { keys: ["paris", "france", "eiffel"], photo: "paris" },
  { keys: ["london", "uk", "england"], photo: "london" },
  { keys: ["tokyo", "japan", "osaka", "kyoto"], photo: "tokyo" },
  { keys: ["new york", "nyc", "manhattan"], photo: "nyc" },
  { keys: ["rome", "italy", "venice", "florence"], photo: "rome" },
  { keys: ["barcelona", "spain", "madrid"], photo: "barcelona" },
  { keys: ["singapore"], photo: "singapore" },
  { keys: ["sydney", "australia", "melbourne"], photo: "sydney" },
  { keys: ["swiss", "alps", "zurich", "interlaken"], photo: "switzerland" },
  { keys: ["beach", "island", "maldives"], photo: "beach" },
  { keys: ["mountain", "trek", "himalaya"], photo: "mountains" },
];

export function photoForQuery(text, fallback = "flight") {
  const hay = String(text || "").toLowerCase();
  const match = KEYWORDS.find((row) => row.keys.some((key) => hay.includes(key)));
  return TRAVEL_PHOTOS[match?.photo || fallback] || TRAVEL_PHOTOS.flight;
}

export function tripCoverSrc(trip) {
  if (trip?.coverPhotoUrl) {
    return trip.coverPhotoUrl;
  }
  const cities = (trip?.stops || [])
    .map((stop) => [stop.city?.name, stop.city?.country].filter(Boolean).join(" "))
    .join(" ");
  return photoForQuery(`${trip?.name || ""} ${cities}`);
}

export function tripCoverFallback(trip) {
  const cities = (trip?.stops || [])
    .map((stop) => [stop.city?.name, stop.city?.country].filter(Boolean).join(" "))
    .join(" ");
  return photoForQuery(`${trip?.name || ""} ${cities}`);
}

export function cityCoverSrc(city) {
  return photoForQuery([city?.name, city?.region, city?.country].filter(Boolean).join(" "), "city");
}
