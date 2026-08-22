import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarRange,
  Compass,
  Globe,
  Lock,
  LogOut,
  Mail,
  MapPinned,
  Plane,
  UserRound,
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import TripCard from "../components/TripCard.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, explainApiError } from "../lib/api.js";
import { isUpcomingTrip } from "../lib/dates.js";
import { listTrips } from "../lib/tripsApi.js";
import Alert from "../ui/Alert.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import ModalFrame from "../ui/ModalFrame.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import StatCard from "../ui/StatCard.jsx";

function languageLabel(code) {
  if (!code) {
    return null;
  }
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}

function memberSinceLabel(createdAt) {
  if (!createdAt) {
    return null;
  }
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function mostUsedCurrency(trips) {
  const counts = new Map();
  for (const trip of trips) {
    if (!trip.currency) {
      continue;
    }
    counts.set(trip.currency, (counts.get(trip.currency) || 0) + 1);
  }
  let best = null;
  let max = 0;
  for (const [code, count] of counts) {
    if (count > max) {
      best = code;
      max = count;
    }
  }
  return best;
}

function ProfileSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading profile</p>
      <div className="gt-card overflow-hidden">
        <div className="h-28 animate-pulse bg-[linear-gradient(135deg,#d9cfc0,#cfe4e1)]" />
        <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:gap-6">
          <div className="-mt-10 h-20 w-20 shrink-0 animate-pulse rounded-full bg-sand sm:h-24 sm:w-24" />
          <div className="min-w-0 flex-1 space-y-2 pt-2">
            <div className="h-7 w-48 max-w-full animate-pulse rounded-lg bg-sand" />
            <div className="h-4 w-56 max-w-full animate-pulse rounded-lg bg-sand" />
            <div className="h-4 w-36 max-w-full animate-pulse rounded-lg bg-sand" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-sand" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-sand" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-sand" />
        <div className="h-64 animate-pulse rounded-2xl bg-sand" />
      </div>
    </section>
  );
}

function PreferenceRow({ label, value, comingSoon }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 break-words text-sm text-muted">{value}</p>
      </div>
      {comingSoon ? <Badge tone="muted">Coming soon</Badge> : null}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await listTrips();
        if (!cancelled) {
          setTrips(data.trips || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load your trips"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = useMemo(() => trips.filter((trip) => isUpcomingTrip(trip)), [trips]);
  const recent = useMemo(
    () =>
      [...trips]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3),
    [trips],
  );
  const destinationTotal = trips.reduce((sum, trip) => sum + (trip.destinationCount || 0), 0);
  const tripCurrency = mostUsedCurrency(trips);
  const since = memberSinceLabel(user?.createdAt);
  const language = languageLabel(user?.language);
  const roleLabel = user?.role === "ADMIN" ? "Admin" : "Traveler";

  async function handleLogout() {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  async function handlePasswordReset() {
    if (resetBusy || !user?.email) {
      return;
    }
    setResetBusy(true);
    setResetError("");
    setResetMessage("");
    try {
      const data = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email: user.email },
      });
      setResetMessage(data.message || "If that email is registered, a reset link is on the way.");
    } catch (err) {
      setResetError(explainApiError(err, "Unable to send a reset email"));
    } finally {
      setResetBusy(false);
    }
  }

  if (!user) {
    return <ProfileSkeleton />;
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <section className="min-w-0 space-y-6">
      <div className="gt-card overflow-hidden">
        <div className="h-28 bg-[linear-gradient(125deg,#0d5757_0%,#10212a_55%,#d45a3c_140%)]" />
        <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-10 shrink-0 rounded-full bg-[#fffdf9] p-1 shadow-sm">
              <UserAvatar user={user} size="lg" />
            </div>
            <div className="min-w-0 pt-1">
              <h1 className="gt-title break-words">{user.name}</h1>
              {user.email ? (
                <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              ) : null}
              <p className="mt-2 text-sm text-muted">
                {roleLabel} · GlobeTrotter member
                {since ? ` · Joined ${since}` : ""}
              </p>
            </div>
          </div>
          <Button variant="coral" className="w-full sm:w-auto" onClick={() => setEditOpen(true)}>
            <UserRound size={16} />
            Edit profile
          </Button>
        </div>
      </div>

      <Alert>{error}</Alert>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total trips" value={String(trips.length)} icon={Plane} />
        <StatCard label="Upcoming" value={String(upcoming.length)} icon={CalendarRange} />
        <StatCard
          label="Destinations"
          value={String(destinationTotal)}
          icon={MapPinned}
        />
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="gt-card p-5">
            <SectionHeader title="Travel preferences" />
            <PreferenceRow
              label="Preferred language"
              value={language || "Not set"}
            />
            <PreferenceRow
              label="Currency"
              value={
                tripCurrency
                  ? `Most used on trips: ${tripCurrency}`
                  : "No trip currency yet"
              }
              comingSoon
            />
            <PreferenceRow
              label="Travel style"
              value="Saved styles will appear here."
              comingSoon
            />
            <PreferenceRow
              label="Favorite destination types"
              value="City, beach, and mountain picks will live here."
              comingSoon
            />
          </div>

          <div className="gt-card p-5">
            <SectionHeader title="Account" />
            <div className="space-y-4">
              <div>
                <p className="gt-eyebrow">Profile information</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex min-w-0 justify-between gap-3">
                    <dt className="text-muted">Name</dt>
                    <dd className="min-w-0 break-words font-medium">{user.name}</dd>
                  </div>
                  {user.email ? (
                    <div className="flex min-w-0 justify-between gap-3">
                      <dt className="text-muted">Email</dt>
                      <dd className="min-w-0 truncate font-medium">{user.email}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <div className="border-t border-line pt-4">
                <p className="gt-eyebrow">Security</p>
                <p className="mt-2 text-sm text-muted">
                  There is no in-app change-password form. We can send a reset link to your email.
                </p>
                <Alert className="mt-3">{resetError}</Alert>
                <Alert tone="success" className="mt-3">
                  {resetMessage}
                </Alert>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={handlePasswordReset}
                  disabled={resetBusy || !user.email}
                >
                  <Lock size={14} />
                  {resetBusy ? "Sending…" : "Send reset email"}
                </Button>
              </div>
              <div className="border-t border-line pt-4">
                <p className="gt-eyebrow">Session</p>
                <Button
                  variant="danger"
                  className="mt-3 w-full sm:w-auto"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={14} />
                  {loggingOut ? "Logging out…" : "Log out"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div>
            <SectionHeader
              title="Upcoming adventures"
              action={
                upcoming.length > 0 ? (
                  <Link className="text-sm font-semibold text-teal hover:text-teal-dark" to="/trips">
                    View all
                  </Link>
                ) : null
              }
            />
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Compass}
                title="No upcoming adventures"
                description="Your next adventure is waiting."
                action={
                  <Button variant="coral" to="/trips/new">
                    Plan a trip
                  </Button>
                }
              />
            ) : (
              <div className="grid min-w-0 gap-4">
                {upcoming.slice(0, 3).map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeader
              title="Recent trips"
              action={
                recent.length > 0 ? (
                  <Link className="text-sm font-semibold text-teal hover:text-teal-dark" to="/trips">
                    View all
                  </Link>
                ) : null
              }
            />
            {recent.length === 0 ? (
              <EmptyState
                icon={Globe}
                title="No trips yet"
                description="Plan a holiday to start your travel timeline."
                action={
                  <Button variant="coral" to="/trips/new">
                    Plan a trip
                  </Button>
                }
              />
            ) : (
              <div className="grid min-w-0 gap-4">
                {recent.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editOpen ? (
        <ModalFrame
          title="Edit profile"
          description="Name, photo, and language updates are not available on the API yet."
          onClose={() => setEditOpen(false)}
        >
          <div className="rounded-xl border border-line bg-cream/70 p-4">
            <p className="flex items-center gap-2 font-medium">
              <UserRound size={16} className="text-teal" />
              Profile editing will be available soon
            </p>
            <p className="mt-2 text-sm text-muted">
              Your account currently shows the name and email from sign-in. Saving changes here
              would require a profile-update endpoint that is not in the app yet.
            </p>
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="primary" onClick={() => setEditOpen(false)}>
              Close
            </Button>
          </div>
        </ModalFrame>
      ) : null}
    </section>
  );
}
