import { TRAVEL_PHOTOS } from "../lib/travelArt.js";

export default function AuthFormCard({ title, description, children, footer }) {
  return (
    <section className="overflow-hidden">
      <div className="grid min-h-[calc(100svh-4.25rem)] lg:grid-cols-2">
        <div className="relative h-44 overflow-hidden lg:hidden">
          <img
            src={TRAVEL_PHOTOS.flight}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-navy/45" />
          <p className="absolute bottom-4 left-5 font-display text-2xl text-white">Fly farther.</p>
        </div>
        <div className="relative hidden min-h-[18rem] overflow-hidden lg:block">
          <img
            src={TRAVEL_PHOTOS.flight}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/20" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              Flights · stays · itineraries
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Book the journey. We’ll hold the plan.
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/75">
              Multi-city trips with destinations, activities, budgets, and a live map — in one boarding pass.
            </p>
          </div>
        </div>
        <div className="flex items-center bg-[#fffdf9] px-5 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-md">
            <p className="gt-eyebrow">GlobeTrotter</p>
            <h1 className="gt-title mt-2">{title}</h1>
            {description ? <p className="gt-lede mt-3">{description}</p> : null}
            <div className="mt-7">{children}</div>
            {footer ? <div className="mt-6 border-t border-line pt-5 text-sm text-muted">{footer}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-coral">{error}</span> : null}
    </label>
  );
}

export const inputClassName = "gt-input";

export const buttonClassName = "gt-btn gt-btn-coral gt-btn-lg w-full";
