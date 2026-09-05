"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CheckCircle2, PhoneCall, X } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { OPEN_LEAD_POPUP_EVENT, LEAD_INTENTS, type LeadIntentKey } from "./leadPopup";

const BUILDING_IMAGE =
  "/verticals/realestate/templates/premium-v2/images/hero-curated-inventory-v2.png";

/** Whichever of these fires first opens the popup; only one fires per session. */
const TIME_ON_SITE_MS = 30_000;
const SCROLL_TRIGGER_PROGRESS = 0.75;

const INTENTS = [
  { value: "buy", label: "I want to Buy" },
  { value: "sell", label: "I want to Sell" },
  { value: "valuation", label: "I want a Free Valuation" },
];

const FIELD =
  "min-h-[48px] w-full rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3.5 text-[14px] text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none";

const INITIAL_STATE: QueryFormState = { ok: false };

// Skip pages that already carry a full enquiry form of their own — showing
// this on top of /contact would just duplicate what's already right there.
const EXCLUDED_PATH_SUFFIXES = ["/contact", "/thank-you"];

export default function ScrollLeadPopupV2({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const [intent, setIntent] = useState<LeadIntentKey>("default");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);
  const [state, formAction, pending] = useActionState<QueryFormState, FormData>(
    submitQuery,
    INITIAL_STATE,
  );

  useEffect(() => {
    try {
      if (sessionStorage.getItem("gp_lead_popup_seen") === "1") setDismissedForSession(true);
    } catch {
      // Private browsing / storage blocked — the popup can still show once
      // per page load, it just won't remember across pages this session.
    }
  }, []);

  const excluded = EXCLUDED_PATH_SUFFIXES.some((suffix) => pathname?.endsWith(suffix));

  const fire = () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setOpen(true);
  };

  // Three independent triggers, whichever fires first: 75% scroll depth on
  // any one page, a client-side navigation to a second page (this component
  // lives in the shared layout so it mounts once per session, not per
  // page — the effect below only fires on the *second* distinct pathname it
  // sees, never on the first render), or 30s of time on site overall.
  useEffect(() => {
    if (excluded || dismissedForSession || triggeredRef.current) return;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (progress >= SCROLL_TRIGGER_PROGRESS) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const timeoutId = window.setTimeout(fire, TIME_ON_SITE_MS);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timeoutId);
    };
  }, [excluded, dismissedForSession]);

  const firstPathnameRef = useRef<string | null>(null);
  useEffect(() => {
    if (excluded || dismissedForSession || triggeredRef.current || !pathname) return;
    if (firstPathnameRef.current === null) {
      firstPathnameRef.current = pathname;
      return;
    }
    if (pathname !== firstPathnameRef.current) fire();
  }, [pathname, excluded, dismissedForSession]);

  // An explicit "Book Consultation" / "Contact Us" click, dispatched via
  // BookConsultationButton — always opens, regardless of the passive
  // triggers' session-dismissal or one-shot state, since this is a direct
  // request for the form, not an ambient nudge.
  useEffect(() => {
    const onOpenRequest = (event: Event) => {
      const key = (event as CustomEvent<{ intent?: LeadIntentKey }>).detail?.intent;
      setIntent(key && key in LEAD_INTENTS ? key : "default");
      setOpen(true);
    };
    window.addEventListener(OPEN_LEAD_POPUP_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_LEAD_POPUP_EVENT, onOpenRequest);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("gp_lead_popup_seen", "1");
    } catch {
      // Ignore — worst case the popup can trigger again this session.
    }
  };

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLElement>("input, select, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const copy = LEAD_INTENTS[intent];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Request a call back">
      <div className="absolute inset-0 bg-[color:var(--gp-forest-950)]/80" onClick={close} />

      <div
        ref={dialogRef}
        className="relative grid max-h-[92vh] w-full max-w-[1080px] grid-cols-1 overflow-y-auto rounded-[var(--gp-radius-lg)] bg-[color:var(--gp-cream-100)] shadow-[0_38px_100px_-20px_rgba(10,46,44,0.62)] sm:grid-cols-[0.85fr_1.15fr]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/35 sm:text-[color:var(--gp-muted)] sm:bg-transparent sm:hover:bg-[color:var(--gp-cream-200)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative hidden aspect-[4/5] sm:block">
          <Image
            src={BUILDING_IMAGE}
            alt=""
            fill
            sizes="(max-width: 640px) 0px, 320px"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
        </div>

        <div className="p-8 sm:p-11">
          {state.ok ? (
            <div className="flex flex-col items-start gap-3 py-4">
              <CheckCircle2 className="h-9 w-9 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
              <h2 className="font-display text-[22px] text-[color:var(--gp-ink)]">Request received.</h2>
              <p className="text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                An advisor will call you shortly. Reference {state.reference}.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-2 inline-flex min-h-[44px] items-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13px] font-semibold text-[color:var(--gp-forest-950)]"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{copy.eyebrow}</p>
              <h2 className="font-display mt-2 text-[30px] leading-[1.15] text-[color:var(--gp-ink)] sm:text-[34px]">
                {copy.heading}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--gp-muted)]">
                {copy.blurb}
              </p>

              <form action={formAction} className="mt-5 space-y-3">
                <input type="hidden" name="consent" value="on" />
                <input type="hidden" name="preferredContact" value="phone" />
                <input type="hidden" name="landingPage" value={basePath} />
              <input type="hidden" name="intentContext" value={copy.context} />

                <div>
                  <label htmlFor="gp-popup-name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="gp-popup-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className={FIELD}
                    aria-invalid={Boolean(state.errors?.name)}
                  />
                  {state.errors?.name ? (
                    <p role="alert" className="mt-1 text-[12px] text-status-danger">
                      {state.errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="gp-popup-phone" className="sr-only">
                    Mobile number
                  </label>
                  <input
                    id="gp-popup-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    placeholder="Mobile number"
                    className={FIELD}
                    aria-invalid={Boolean(state.errors?.phone)}
                  />
                  {state.errors?.phone ? (
                    <p role="alert" className="mt-1 text-[12px] text-status-danger">
                      {state.errors.phone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="gp-popup-intent" className="sr-only">
                    What are you looking for?
                  </label>
                  <select id="gp-popup-intent" name="message" required defaultValue="" className={FIELD}>
                    <option value="" disabled>
                      What are you looking for?
                    </option>
                    {INTENTS.map((intent) => (
                      <option key={intent.value} value={intent.label}>
                        {intent.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-semibold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  {pending ? "Sending…" : "Get Instant Call"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
