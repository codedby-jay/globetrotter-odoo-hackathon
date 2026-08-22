import { useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import { Field, inputClassName } from "../../components/TripForm.jsx";
import { explainApiError } from "../../lib/api.js";
import useEscapeClose from "../../hooks/useEscapeClose.js";
import {
  publicTripUrl,
  recordShareEvent,
  updateTripVisibility,
} from "../../lib/shareApi.js";
import Button from "../../ui/Button.jsx";
import Alert from "../../ui/Alert.jsx";

const VISIBILITY_HELP = {
  PRIVATE: "Only you can see this trip.",
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
  useEscapeClose(embedded ? undefined : onClose, !saving && !embedded);

  async function saveVisibility(event) {
    event.preventDefault();
    if (saving) {
      return;
    }
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
        <p className="gt-eyebrow">Sharing</p>
        <h2 id="share-trip-title" className="font-display text-2xl font-semibold tracking-tight">
          Share your trip
        </h2>
        <p className="mt-1 text-sm text-muted">{trip.name}</p>
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
          <Field label="Share link">
            <input className={inputClassName} readOnly value={url} />
          </Field>
        ) : (
          <p className="mb-4 text-sm text-muted">
            The public link stays hidden until the trip is unlisted or public.
          </p>
        )}
        <Alert className="mb-3">{error}</Alert>
        <Alert tone="success" className="mb-3">
          {notice}
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" type="submit" disabled={saving} loading={saving}>
            {saving ? "Saving…" : "Save visibility"}
          </Button>
          {visibility !== "PRIVATE" ? (
            <>
              <Button variant="secondary" type="button" onClick={copyLink}>
                <LinkIcon size={14} />
                {copied ? "Link copied!" : "Copy link"}
              </Button>
              <Button variant="secondary" type="button" onClick={nativeShare}>
                Share
              </Button>
            </>
          ) : null}
          {onClose ? (
            <Button variant="ghost" type="button" onClick={onClose}>
              Close
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return <div className="gt-card p-6 md:p-8">{form}</div>;
  }

  return (
    <div className="gt-modal-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-trip-title"
        className="gt-modal max-w-lg"
      >
        {form}
      </div>
    </div>
  );
}
