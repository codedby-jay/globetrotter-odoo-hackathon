import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Wallet } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import TripSubnav from "../components/TripSubnav.jsx";
import AddExpenseModal from "../features/budget/AddExpenseModal.jsx";
import BudgetSummary from "../features/budget/BudgetSummary.jsx";
import EditExpenseModal from "../features/budget/EditExpenseModal.jsx";
import ExpenseList from "../features/budget/ExpenseList.jsx";
import { explainApiError } from "../lib/api.js";
import {
  createExpense,
  deleteExpense,
  getBudgetSummary,
  getTripExpenses,
  updateExpense,
} from "../lib/expensesApi.js";
import { getTrip } from "../lib/tripsApi.js";

export default function BudgetPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState("");

  async function loadAll() {
    const [tripData, expenseData, budgetData] = await Promise.all([
      getTrip(id),
      getTripExpenses(id),
      getBudgetSummary(id),
    ]);
    setTrip(tripData.trip);
    setExpenses(expenseData.expenses || []);
    setSummary(budgetData);
    return tripData.trip;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [tripData, expenseData, budgetData] = await Promise.all([
          getTrip(id),
          getTripExpenses(id),
          getBudgetSummary(id),
        ]);
        if (!cancelled) {
          setTrip(tripData.trip);
          setExpenses(expenseData.expenses || []);
          setSummary(budgetData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load budget"));
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
  }, [id]);

  async function handleCreate(payload) {
    setSaving(true);
    setModalError("");
    try {
      await createExpense(id, payload);
      setShowAdd(false);
      setNotice("Expense added.");
      await loadAll();
    } catch (err) {
      setModalError(explainApiError(err, "Unable to add this expense"));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(payload) {
    if (!editing) {
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await updateExpense(editing.id, payload);
      setEditing(null);
      setNotice("Expense updated.");
      await loadAll();
    } catch (err) {
      setModalError(explainApiError(err, "Unable to update this expense"));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteExpense(pendingDelete.id);
      setPendingDelete(null);
      setNotice("Expense deleted.");
      await loadAll();
    } catch (err) {
      setError(explainApiError(err, "Unable to delete this expense"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading budget…</p>;
  }

  if (error && !trip) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Budget</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold md:text-3xl">
          <Wallet size={26} className="text-teal" />
          {trip?.name || "Trip budget"}
        </h1>
        <p className="mt-2 text-muted">
          Track manual trip expenses. Itinerary stay, transport, and activity costs are
          not counted twice here.
        </p>
        <Link
          to={`/trips/${id}`}
          className="mt-4 inline-block text-sm font-medium text-teal hover:text-teal-dark"
        >
          Back to trip
        </Link>
      </div>

      {notice ? (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-teal-dark">{notice}</p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <BudgetSummary summary={summary} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          onClick={() => {
            setModalError("");
            setShowAdd(true);
          }}
        >
          <Plus size={16} />
          Add expense
        </button>
      </div>

      <ExpenseList
        expenses={expenses}
        currency={trip?.currency}
        onEdit={(item) => {
          setModalError("");
          setEditing(item);
        }}
        onDelete={setPendingDelete}
      />

      {showAdd ? (
        <AddExpenseModal
          trip={trip}
          onClose={() => setShowAdd(false)}
          onSubmit={handleCreate}
          submitting={saving}
          error={modalError}
        />
      ) : null}

      {editing ? (
        <EditExpenseModal
          trip={trip}
          expense={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
          submitting={saving}
          error={modalError}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete this expense?"
          description={`“${pendingDelete.description || pendingDelete.label}” will be removed from this trip.`}
          confirmLabel="Delete expense"
          busyLabel="Deleting…"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
        />
      ) : null}
    </section>
  );
}
