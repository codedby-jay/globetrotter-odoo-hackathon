import { useState, useEffect } from 'react';
import {
  fetchDestinations,
  fetchTrips,
  fetchSharedTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  addActivity,
  calcSpent,
} from './api';

const TABS = ['destinations', 'my-trips', 'shared', 'create'];

function BudgetBar({ budget, spent }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const cls = spent > budget ? 'over' : spent > budget * 0.8 ? 'warn' : 'ok';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span>${spent.toLocaleString()} spent</span>
        <span style={{ color: 'var(--text-muted)' }}>Budget: ${budget.toLocaleString()}</span>
      </div>
      <div className="budget-bar">
        <div className={`budget-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DestinationCard({ dest, onAdd }) {
  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <img
        src={dest.imageUrl}
        alt={dest.name}
        style={{ width: '100%', height: 160, objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div style={{ padding: '1rem' }}>
        <h3>{dest.name}, {dest.country}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
          {dest.description}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {dest.tags?.map((t) => <span key={t} className="badge">{t}</span>)}
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => onAdd(dest)}>
          Add to Trip
        </button>
      </div>
    </div>
  );
}

function TripCard({ trip, onSelect, onDelete, onToggleShare }) {
  const spent = calcSpent(trip);
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => onSelect(trip)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3>{trip.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{trip.description}</p>
        </div>
        {trip.shared && <span className="badge">Shared</span>}
      </div>
      <div style={{ margin: '0.75rem 0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {trip.cities?.map((c) => <span key={c} className="badge">{c}</span>)}
      </div>
      <BudgetBar budget={trip.budget} spent={spent} />
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        {trip.activities?.length || 0} activities
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => onToggleShare(trip)}>
          {trip.shared ? 'Unshare' : 'Share'}
        </button>
        <button className="btn-danger" style={{ fontSize: '0.8rem' }} onClick={() => onDelete(trip._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

function TripDetail({ trip, onBack, onAddActivity, onRefresh }) {
  const [form, setForm] = useState({ name: '', city: '', date: '', cost: '', notes: '' });
  const spent = calcSpent(trip);

  const handleAdd = async (e) => {
    e.preventDefault();
    await onAddActivity(trip._id, {
      name: form.name,
      city: form.city,
      date: form.date,
      cost: Number(form.cost) || 0,
      notes: form.notes,
    });
    setForm({ name: '', city: '', date: '', cost: '', notes: '' });
    onRefresh();
  };

  return (
    <div>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back to Trips
      </button>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>{trip.title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{trip.description}</p>
        <div style={{ margin: '1rem 0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {trip.cities?.map((c) => <span key={c} className="badge">{c}</span>)}
        </div>
        <BudgetBar budget={trip.budget} spent={spent} />
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Activities</h3>
      {trip.activities?.length === 0 ? (
        <div className="empty-state card">
          <h3>No activities yet</h3>
          <p>Add your first activity below.</p>
        </div>
      ) : (
        <div className="grid" style={{ marginBottom: '1.5rem' }}>
          {trip.activities.map((a, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{a.name}</strong>
                <span style={{ color: 'var(--warning)' }}>${a.cost}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {a.city} · {a.date}
              </p>
              {a.notes && <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{a.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Add Activity</h3>
        <form onSubmit={handleAdd}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Activity Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Cost ($)</label>
              <input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Add Activity</button>
        </form>
      </div>
    </div>
  );
}

function CreateTripForm({ onCreated, prefillCity }) {
  const [form, setForm] = useState({
    title: prefillCity ? `Trip to ${prefillCity}` : '',
    description: '',
    cities: prefillCity ? [prefillCity] : [],
    budget: '',
    cityInput: prefillCity || '',
  });

  const addCity = () => {
    const city = form.cityInput.trim();
    if (city && !form.cities.includes(city)) {
      setForm({ ...form, cities: [...form.cities, city], cityInput: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trip = await createTrip({
      title: form.title,
      description: form.description,
      cities: form.cities,
      budget: Number(form.budget) || 0,
    });
    onCreated(trip);
  };

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Create New Trip</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Trip Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Cities</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={form.cityInput}
              onChange={(e) => setForm({ ...form, cityInput: e.target.value })}
              placeholder="Add a city"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
            />
            <button type="button" className="btn-secondary" onClick={addCity}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {form.cities.map((c) => (
              <span key={c} className="badge" style={{ cursor: 'pointer' }}
                onClick={() => setForm({ ...form, cities: form.cities.filter((x) => x !== c) })}>
                {c} ×
              </span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Budget ($)</label>
          <input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary">Create Trip</button>
      </form>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('destinations');
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [sharedTrips, setSharedTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [prefillCity, setPrefillCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dests, myTrips, shared] = await Promise.all([
        fetchDestinations(),
        fetchTrips(),
        fetchSharedTrips(),
      ]);
      setDestinations(dests);
      setTrips(myTrips);
      setSharedTrips(shared);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddToTrip = (dest) => {
    setPrefillCity(dest.name);
    setTab('create');
  };

  const handleCreated = (trip) => {
    setTrips([trip, ...trips]);
    setSelectedTrip(trip);
    setTab('my-trips');
    setPrefillCity('');
  };

  const handleDelete = async (id) => {
    await deleteTrip(id);
    setTrips(trips.filter((t) => t._id !== id));
    if (selectedTrip?._id === id) setSelectedTrip(null);
  };

  const handleToggleShare = async (trip) => {
    const updated = await updateTrip(trip._id, { shared: !trip.shared });
    setTrips(trips.map((t) => (t._id === updated._id ? updated : t)));
    loadData();
  };

  const handleAddActivity = async (tripId, activity) => {
    const updated = await addActivity(tripId, activity);
    setSelectedTrip(updated);
    setTrips(trips.map((t) => (t._id === updated._id ? updated : t)));
  };

  const refreshSelectedTrip = async () => {
    if (!selectedTrip) return;
    const updated = trips.find((t) => t._id === selectedTrip._id);
    if (updated) setSelectedTrip(updated);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🌍</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>GlobeTrotter</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Plan multi-city trips, discover destinations, manage activities, and track your budget.
        </p>
      </header>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? 'btn-primary' : 'btn-secondary'}
            onClick={() => { setTab(t); setSelectedTrip(null); }}
          >
            {t === 'destinations' && 'Discover'}
            {t === 'my-trips' && 'My Trips'}
            {t === 'shared' && 'Shared Trips'}
            {t === 'create' && '+ New Trip'}
          </button>
        ))}
      </nav>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1rem', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : (
        <>
          {tab === 'destinations' && (
            <div className="grid grid-2">
              {destinations.map((d) => (
                <DestinationCard key={d._id} dest={d} onAdd={handleAddToTrip} />
              ))}
            </div>
          )}

          {tab === 'my-trips' && (
            selectedTrip ? (
              <TripDetail
                trip={selectedTrip}
                onBack={() => setSelectedTrip(null)}
                onAddActivity={handleAddActivity}
                onRefresh={refreshSelectedTrip}
              />
            ) : trips.length === 0 ? (
              <div className="empty-state card">
                <h3>No trips yet</h3>
                <p>Create your first trip to start planning!</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setTab('create')}>
                  Create Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-2">
                {trips.map((t) => (
                  <TripCard
                    key={t._id}
                    trip={t}
                    onSelect={setSelectedTrip}
                    onDelete={handleDelete}
                    onToggleShare={handleToggleShare}
                  />
                ))}
              </div>
            )
          )}

          {tab === 'shared' && (
            sharedTrips.length === 0 ? (
              <div className="empty-state card">
                <h3>No shared trips</h3>
                <p>Share one of your trips to inspire other travelers!</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {sharedTrips.map((t) => (
                  <TripCard
                    key={t._id}
                    trip={t}
                    onSelect={setSelectedTrip}
                    onDelete={() => {}}
                    onToggleShare={() => {}}
                  />
                ))}
              </div>
            )
          )}

          {tab === 'create' && (
            <CreateTripForm onCreated={handleCreated} prefillCity={prefillCity} />
          )}
        </>
      )}
    </div>
  );
}
