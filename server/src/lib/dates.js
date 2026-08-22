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
