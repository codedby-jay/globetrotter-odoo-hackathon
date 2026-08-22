export function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(startDate, endDate) {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function formatMoney(amount, currency = "USD") {
  if (amount === null || amount === undefined) {
    return "No budget set";
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function isUpcomingTrip(trip, today = new Date()) {
  const end = new Date(`${trip.endDate}T00:00:00`);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return end >= startOfToday;
}

export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaultStopDates(trip) {
  const lastEnd = trip.stops?.at(-1)?.endDate;
  let startDate = trip.startDate;
  if (lastEnd && lastEnd < trip.endDate) {
    const nextDay = addDays(lastEnd, 1);
    startDate = nextDay <= trip.endDate ? nextDay : trip.endDate;
  }
  let endDate = addDays(startDate, 1);
  if (endDate > trip.endDate) {
    endDate = trip.endDate;
  }
  return { startDate, endDate };
}
