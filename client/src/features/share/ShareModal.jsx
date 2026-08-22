import { useState } from "react";
import { Link } from "lucide-react";
import { Field, inputClassName } from "../../components/TripForm.jsx";
import { explainApiError } from "../../lib/api.js";
import {
  publicTripUrl,
  recordShareEvent,
  updateTripVisibility,
} from "../../lib/shareApi.js";

const VISIBILITY_HELP = {
  PRIVATE: "This trip is private.",
  UNLISTED: "Anyone with the link can view this trip.",
  PUBLIC: "Anyone can view this trip.",
};

export default function ShareModal({ trip, onClose, onSaved, embedded = false }) {
  const [visibility, setVisibility] = useState(trip.visibility || "PRIVATE");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const url = publicTripUrl(trip.shareSlug);

  async function saveVisibility(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await updateTripVisibility(trip.id, visibility);
      setNotice("Visibility saved.");
      onSaved?.(data.trip);
    } catch (err) {
      setError(explainApiError(err, "Unable to update sharing"));
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setNotice("Link copied!");
      recordShareEvent(trip.id).catch(() => {});
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the link.");
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: trip.name,
        text: trip.description || "Check out this GlobeTrotter itinerary.",
        url,
      });
      recordShareEvent(trip.id).catch(() => {});
    } catch {
      // User cancelled share sheet.
    }
  }

  const form = (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Share your trip</h2>
        <p className="text-sm text-muted">{trip.name}</p>
      </div>
      <form onSubmit={saveVisibility}>
        <Field label="Visibility">
          <select
            className={inputClassName}
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </Field>
        <p className="mb-4 text-sm text-muted">{VISIBILITY_HELP[visibility]}</p>
        {visibility !== "PRIVATE" ? (
          <Field label="Public URL">
            <input className={inputClassName} readOnly value={url} />
          </Field>
        ) : (
          <p className="mb-4 text-sm text-muted">
            Public link: hidden until the trip is unlisted or public.
          </p>
        )}
        {error ? <p className="mb-3 text-sm text-coral">{error}</p> : null}
        {notice ? <p className="mb-3 text-sm text-teal-dark">{notice}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save visibility"}
          </button>
          {visibility !== "PRIVATE" ? (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-2 text-sm hover:bg-sand"
                onClick={copyLink}
              >
                <Link size={14} />
                {copied ? "Link copied!" : "Copy link"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-sand px-3 py-2 text-sm hover:bg-sand"
                onClick={nativeShare}
              >
                Share
              </button>
            </>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm hover:bg-sand"
              onClick={onClose}
            >
              Close
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">{form}</div>;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl sm:p-6">
        {form}
      </div>
    </div>
  );
}
