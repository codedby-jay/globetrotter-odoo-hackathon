import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { explainApiError } from "../../lib/api.js";
import {
  analyzeTripAssistant,
  chatAssistant,
  getAssistantSuggestions,
} from "../../lib/assistantApi.js";
import { formatCurrency } from "../../lib/dates.js";
import AssistantLoading from "./AssistantLoading.jsx";
import AssistantMessage from "./AssistantMessage.jsx";
import SuggestionCard from "./SuggestionCard.jsx";
import TripAnalysis from "./TripAnalysis.jsx";

const QUICK = [
  { id: "analyze", label: "Analyze my trip" },
  { id: "suggest", label: "Suggest activities" },
  { id: "budget", label: "Optimize my budget" },
  { id: "empty", label: "Find empty days" },
];

export default function TripAssistant({ trip, mode }) {
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recSummary, setRecSummary] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currency = trip?.currency || "USD";

  async function loadAnalysis() {
    setBusy(true);
    setError("");
    try {
      const result = await analyzeTripAssistant(trip.id);
      setAnalysis(result);
      if (result.recommendations?.length) {
        setRecommendations(result.recommendations);
        setRecSummary("Catalog ideas that fit lighter days on this trip.");
      }
    } catch (err) {
      setError(explainApiError(err, "Unable to analyze this trip"));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  async function runSuggestions() {
    setBusy(true);
    setError("");
    try {
      const result = await getAssistantSuggestions(trip.id, {
        style: "balanced",
        interests: ["culture", "food", "nature"],
        budgetPriority: "medium",
      });
      setRecommendations(result.recommendations || []);
      setRecSummary(result.summary || "");
    } catch (err) {
      setError(explainApiError(err, "Unable to load suggestions"));
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(text) {
    const message = text.trim();
    if (!message || busy) {
      return;
    }
    setBusy(true);
    setError("");
    setMessages((current) => [...current, { role: "user", text: message }]);
    setDraft("");
    try {
      const result = await chatAssistant(trip.id, message);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer, mode: result.mode },
      ]);
      if (result.relatedSuggestions?.length) {
        setRecommendations(result.relatedSuggestions);
      }
    } catch (err) {
      setError(explainApiError(err, "Unable to answer that question"));
    } finally {
      setBusy(false);
    }
  }

  function onQuick(id) {
    if (id === "analyze") {
      return loadAnalysis();
    }
    if (id === "suggest") {
      return runSuggestions();
    }
    if (id === "budget") {
      return sendMessage("How can I stay within my budget?");
    }
    return sendMessage("Which days are empty?");
  }

  const budget = analysis?.budget;
  const health = analysis?.health;
  const used = Math.min(Math.max(budget?.percentage || 0, 0), 100);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">AI Trip Assistant</p>
        <h1 className="text-2xl font-semibold md:text-3xl">{trip.name}</h1>
        <p className="max-w-2xl text-sm text-muted">
          Get smart insights about your itinerary, budget and schedule.
        </p>
        <p className="inline-flex rounded-full bg-sand px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted">
          {mode === "ai" ? "Optional AI available" : "Smart Analysis Mode"}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {QUICK.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-sand disabled:opacity-60"
            disabled={busy}
            onClick={() => onQuick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {budget ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Trip Health</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">Budget</p>
              <p className="mt-2 text-lg font-semibold">
                {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.limit, currency)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand">
                <div className="h-full bg-teal" style={{ width: `${used}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{budget.percentage}% used</p>
            </article>
            <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">Itinerary</p>
              <p className="mt-2 text-lg font-semibold">{health?.activities ?? 0} activities</p>
            </article>
            <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">Destinations</p>
              <p className="mt-2 text-lg font-semibold">{health?.destinations ?? 0}</p>
            </article>
            <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">Warnings</p>
              <p className="mt-2 text-lg font-semibold">{health?.warnings ?? 0}</p>
            </article>
          </div>
        </section>
      ) : null}

      {busy ? <AssistantLoading /> : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <TripAnalysis analysis={analysis} />

      {recommendations.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recommendations</h2>
          {recSummary ? <p className="text-sm text-muted">{recSummary}</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((item) => (
              <SuggestionCard
                key={`${item.title}-${item.suggestedDate}`}
                item={item}
                currency={currency}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Ask about your trip</h2>
        <div className="space-y-3">
          {messages.map((item, index) => (
            <AssistantMessage
              key={`${item.role}-${index}`}
              role={item.role}
              text={item.text}
              mode={item.mode}
            />
          ))}
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(draft);
          }}
        >
          <input
            className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none ring-teal focus:ring-2"
            placeholder="I have remaining budget. What can I do?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={busy}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60"
            disabled={busy || !draft.trim()}
          >
            <Send size={16} />
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
