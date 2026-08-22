const API = '/api';

export async function fetchDestinations() {
  const res = await fetch(`${API}/destinations`);
  if (!res.ok) throw new Error('Failed to fetch destinations');
  return res.json();
}

export async function fetchTrips() {
  const res = await fetch(`${API}/trips`);
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function fetchSharedTrips() {
  const res = await fetch(`${API}/trips/shared`);
  if (!res.ok) throw new Error('Failed to fetch shared trips');
  return res.json();
}

export async function createTrip(data) {
  const res = await fetch(`${API}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create trip');
  return res.json();
}

export async function updateTrip(id, data) {
  const res = await fetch(`${API}/trips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update trip');
  return res.json();
}

export async function deleteTrip(id) {
  const res = await fetch(`${API}/trips/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete trip');
  return res.json();
}

export async function addActivity(tripId, activity) {
  const res = await fetch(`${API}/trips/${tripId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  if (!res.ok) throw new Error('Failed to add activity');
  return res.json();
}

export function calcSpent(trip) {
  return (trip.activities || []).reduce((sum, a) => sum + (a.cost || 0), 0);
}
