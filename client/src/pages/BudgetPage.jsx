import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageLoader from "../components/PageLoader.jsx";
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
    if (saving) {
      return;
    }
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
    if (!editing || saving) {
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
    return <PageLoader label="Loading budget…" />;
  }

  if (error && !trip) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      <div className="gt-card p-6 md:p-8">
        <p className="gt-eyebrow">Budget</p>
        <h1 className="gt-title mt-2">{trip?.name || "Trip budget"}</h1>
        <p className="gt-lede mt-2">
          Track manual trip expenses. Itinerary stay, transport, and activity costs are
          not counted twice here.
        </p>
        <Link
          to={`/trips/${id}`}
          className="mt-4 inline-block text-sm font-semibold text-teal hover:text-teal-dark"
        >
          Back to trip
        </Link>
      </div>

      {notice ? (
        <p className="gt-alert gt-alert-success">{notice}</p>
      ) : null}
      {error ? <p className="gt-alert gt-alert-error">{error}</p> : null}

      <BudgetSummary summary={summary} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight">Expenses</h2>
        <button
          type="button"
          className="gt-btn gt-btn-coral"
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
        onAdd={() => {
          setModalError("");
          setShowAdd(true);
        }}
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
