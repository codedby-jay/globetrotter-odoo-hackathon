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

export function formatCurrency(amount, currency = "USD") {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe}`;
  }
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

export function formatDuration(minutes) {
  if (minutes == null || minutes === "") {
    return null;
  }
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }
  if (hours) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

export function addMinutesToTime(time, minutes) {
  if (!time || minutes == null) {
    return "";
  }
  const [hours, mins] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) {
    return "";
  }
  const total = hours * 60 + mins + Number(minutes);
  if (total < 0 || total > 24 * 60) {
    return "";
  }
  const nextHours = String(Math.floor(total / 60)).padStart(2, "0");
  const nextMins = String(total % 60).padStart(2, "0");
  return `${nextHours}:${nextMins}`;
}

export function timeToMinutes(time) {
  if (!time) {
    return null;
  }
  const [hours, mins] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) {
    return null;
  }
  return hours * 60 + mins;
}

export function activityLabel(item) {
  return item?.customName || item?.activity?.name || item?.name || "Activity";
}

export function categoryLabel(type) {
  if (!type) {
    return "Activity";
  }
  return type.charAt(0) + type.slice(1).toLowerCase();
}
