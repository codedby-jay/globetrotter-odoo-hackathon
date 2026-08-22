import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { explainApiError } from "../../lib/api.js";
import { analyzeTrip, chatTripAssistant, getTripSuggestions } from "../../lib/aiApi.js";
import { formatCurrency } from "../../lib/dates.js";
import AIEmptyState from "./AIEmptyState.jsx";
import ChatMessage from "./ChatMessage.jsx";
import SuggestionCard from "./SuggestionCard.jsx";
import TripAnalysisCard from "./TripAnalysisCard.jsx";

const QUICK = [
  { id: "suggest", label: "Suggest activities" },
  { id: "budget", label: "Optimize my budget" },
  { id: "analyze", label: "Analyze itinerary" },
  { id: "empty", label: "Find empty days" },
];

export default function TripAssistant({ trip, configured }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currency = trip?.currency || "USD";

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
      const result = await chatTripAssistant(trip.id, message);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer, source: result.source },
      ]);
      if (result.suggestions?.length) {
        setRecommendations(result.suggestions);
        setSummary("Ideas from your question");
      }
    } catch (err) {
      setError(explainApiError(err, "Unable to reach the trip assistant"));
    } finally {
      setBusy(false);
    }
  }

  async function runSuggestions() {
    setBusy(true);
    setError("");
    try {
      const result = await getTripSuggestions(trip.id, {
        style: "balanced",
        interests: ["culture", "food", "nature"],
        budgetPriority: "medium",
      });
      setRecommendations(result.recommendations || []);
      setSummary(result.summary || "");
    } catch (err) {
      setError(explainApiError(err, "Unable to load suggestions"));
    } finally {
      setBusy(false);
    }
  }

  async function runAnalyze() {
    setBusy(true);
    setError("");
    try {
      const result = await analyzeTrip(trip.id);
      setAnalysis(result);
    } catch (err) {
      setError(explainApiError(err, "Unable to analyze this trip"));
    } finally {
      setBusy(false);
    }
  }

  function onQuick(id) {
    if (id === "suggest") {
      return runSuggestions();
    }
    if (id === "analyze") {
      return runAnalyze();
    }
    if (id === "budget") {
      return sendMessage("How can I stay within my budget?");
    }
    return sendMessage("Find gaps in my itinerary and list empty days.");
  }

  return (
    <div className="space-y-6">
      <AIEmptyState configured={configured} />

      <form
        className="rounded-2xl border border-sand bg-white p-4 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(draft);
        }}
      >
        <label htmlFor="ai-question" className="text-sm font-medium">
          Ask anything about your trip.
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="ai-question"
            className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none ring-teal focus:ring-2"
            placeholder="What should I do in Delhi?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={busy}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60"
            disabled={busy || !draft.trim()}
          >
            {busy ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}
            Send
          </button>
        </div>
      </form>

      <div>
        <p className="mb-2 text-sm font-medium">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-muted shadow-sm hover:bg-sand disabled:opacity-60"
              disabled={busy}
              onClick={() => onQuick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {busy ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="animate-spin" size={16} />
          Thinking…
        </p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      {messages.length ? (
        <div className="space-y-3">
          {messages.map((item, index) => (
            <ChatMessage key={`${item.role}-${index}`} role={item.role} text={item.text} source={item.source} />
          ))}
        </div>
      ) : null}

      {trip?.budgetLimit != null ? (
        <p className="text-sm text-muted">
          Budget {formatCurrency(trip.budgetLimit, currency)}. Ask about remaining funds — totals come from
          recorded expenses, not guessed by the model.
        </p>
      ) : null}

      {recommendations.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recommendations</h2>
          {summary ? <p className="text-sm text-muted">{summary}</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((item) => (
              <SuggestionCard key={`${item.title}-${item.suggestedDate}`} item={item} currency={currency} />
            ))}
          </div>
        </section>
      ) : null}

      <TripAnalysisCard analysis={analysis} />
    </div>
  );
}
