import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">
        Dashboard
      </p>
      <h1 className="mb-3 text-2xl font-semibold md:text-3xl">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="max-w-2xl text-muted">
        You are signed in as {user?.email}. Trip planning screens will be added in a
        later step.
      </p>
    </section>
  );
}
