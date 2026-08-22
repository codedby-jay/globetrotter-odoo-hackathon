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
      <header className="space-y-3">
        <p className="gt-eyebrow">AI Trip Assistant</p>
        <h1 className="gt-title">{trip.name}</h1>
        <p className="gt-lede">
          Insights on itinerary, budget, and schedule — without inventing records.
        </p>
        <p className="gt-chip bg-sand text-muted">
          {mode === "ai" ? "Optional AI available" : "Smart Analysis Mode"}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {QUICK.map((item) => (
          <button
            key={item.id}
            type="button"
            className="gt-btn gt-btn-secondary"
            disabled={busy}
            onClick={() => onQuick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {budget ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">Trip health</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="gt-card p-4">
              <p className="gt-eyebrow">Budget</p>
              <p className="mt-2 font-display text-lg font-semibold">
                {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.limit, currency)}
              </p>
              <div className="gt-progress mt-3">
                <span style={{ width: `${used}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{budget.percentage}% used</p>
            </article>
            <article className="gt-card p-4">
              <p className="gt-eyebrow">Itinerary</p>
              <p className="mt-2 font-display text-lg font-semibold">{health?.activities ?? 0} activities</p>
            </article>
            <article className="gt-card p-4">
              <p className="gt-eyebrow">Destinations</p>
              <p className="mt-2 font-display text-lg font-semibold">{health?.destinations ?? 0}</p>
            </article>
            <article className="gt-card p-4">
              <p className="gt-eyebrow">Warnings</p>
              <p className="mt-2 font-display text-lg font-semibold">{health?.warnings ?? 0}</p>
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

      <section className="gt-card space-y-3 p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">Ask about your trip</h2>
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
          <label className="sr-only" htmlFor="assistant-message">
            Ask about your trip
          </label>
          <input
            id="assistant-message"
            className="gt-input min-w-0 w-full"
            placeholder="I have remaining budget. What can I do?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={busy}
          />
          <button
            type="submit"
            className="gt-btn gt-btn-primary"
            disabled={busy || !draft.trim()}
          >
            <Send size={16} aria-hidden />
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
