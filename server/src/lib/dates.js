export function dateOnly(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

export function toDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function money(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

export function utcToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function compareDateOnly(left, right) {
  return dateOnly(left) <= dateOnly(right);
}

const CLOCK_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function formatClock(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(11, 16);
}

export function parseClock(value) {
  if (value == null || value === "") {
    return null;
  }
  if (value instanceof Date) {
    return new Date(`1970-01-01T${formatClock(value)}:00.000Z`);
  }

  const text = String(value).trim();
  const match = text.match(CLOCK_PATTERN);
  if (match) {
    return new Date(`1970-01-01T${match[1]}:${match[2]}:00.000Z`);
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(`1970-01-01T${formatClock(parsed)}:00.000Z`);
}

export function clockToMinutes(value) {
  const date = parseClock(value);
  if (!date) {
    return null;
  }
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function addMinutesToClock(value, minutes) {
  const start = clockToMinutes(value);
  if (start == null || minutes == null) {
    return null;
  }
  const total = start + Number(minutes);
  if (total < 0 || total > 24 * 60) {
    return null;
  }
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const mins = String(total % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}
