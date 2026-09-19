"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { analytics } from "@/lib/analytics";
import { PhoneField } from "./LeadFields";

/**
 * The enquiry form on the farmhouse-rental pages.
 *
 * The site's main contact form asks a buyer's questions — client type,
 * requirement, which service — and none of them is what an owner needs to
 * answer a letting enquiry. Here the four things that decide whether a date
 * can be held at all are asked directly: occasion, date, headcount, budget.
 *
 * It writes through the same `submitQuery` action as every other form on the
 * site rather than a new endpoint, composing the four answers into the
 * message field, so consent handling, the honeypot, phone validation and the
 * CRM write path stay in one place.
 */

const FIELD =
  "w-full min-h-[48px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white/85 px-3.5 text-[14px] text-[color:var(--gp-ink)] placeholder:text-[color:var(--gp-muted)] transition-colors focus:border-[color:var(--gp-gold-600)] focus:bg-white focus:outline-none";
const LABEL = "mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]";

const INITIAL: QueryFormState = { ok: false };

const GUEST_BANDS = ["Up to 25", "25–50", "50–100", "100–250", "250–500", "500+"];
// The day rates Evergreen actually quotes, catering included. Kept in step with
// the rent ladder in `lib/premium-v2/lead-intent.ts`, which the generic forms
// use — a rental enquiry should offer the same bands wherever it is raised.
const BUDGET_BANDS = [
  "₹15,000 – ₹30,000",
  "₹30,000 – ₹50,000",
  "₹50,000 – ₹75,000",
  "₹75,000+",
  "Not sure yet",
];

export default function RentalEnquiryFormV2({
  occasions,
  defaultOccasion,
  areas,
  defaultArea,
  thankYouHref,
  heading = "Check a date",
  blurb = "Tell us the date and the headcount and we will come back with what is actually free, and what it costs.",
}: {
  occasions: { slug: string; label: string }[];
  defaultOccasion?: string;
  areas: { slug: string; name: string }[];
  defaultArea?: string;
  thankYouHref: string;
  heading?: string;
  blurb?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitQuery, INITIAL);
  const [started, setStarted] = useState(false);
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState(defaultOccasion ?? "");
  const [area, setArea] = useState(defaultArea ?? "");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");
  const landingPage = useRef("");

  useEffect(() => {
    landingPage.current = window.location.pathname;
  }, []);

  useEffect(() => {
    if (state.ok && state.reference) {
      analytics.generateLead("rental_enquiry", "website", occasion || undefined);
      router.push(`${thankYouHref}?ref=${encodeURIComponent(state.reference)}`);
    }
  }, [state, router, thankYouHref, occasion]);

  const onFirstInteraction = () => {
    if (started) return;
    setStarted(true);
    analytics.formStart("rental_enquiry", "farmhouse_rental");
  };

  const err = (field: string) => state.errors?.[field];

  const occasionLabel = occasions.find((o) => o.slug === occasion)?.label ?? occasion;
  const areaName = areas.find((a) => a.slug === area)?.name ?? area;

  // What the advisor sees in the CRM, assembled from the four answers rather
  // than left for them to piece together out of a free-text note.
  const composed = [
    occasionLabel ? `Occasion: ${occasionLabel}` : "",
    areaName ? `Area: ${areaName}` : "",
    date ? `Date: ${date}` : "",
    guests ? `Guests: ${guests}` : "",
    budget ? `Budget: ${budget}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] p-6 sm:p-7">
      <h2 className="font-display text-[20px] text-[color:var(--gp-ink)]">{heading}</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">{blurb}</p>

      <form action={formAction} onFocus={onFirstInteraction} className="mt-5 space-y-4" noValidate>
        <input type="hidden" name="landingPage" value={landingPage.current} />
        <input type="hidden" name="message" value={composed} />
        <input type="hidden" name="clientType" value="individual" />

        {/* Not shown to people; catches automated submissions. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="company-rental">Company</label>
          <input id="company-rental" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {state.message && !state.ok ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-300)]/25 px-3.5 py-3 text-[13px] text-[color:var(--gp-ink)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
            {state.message}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rental-occasion" className={LABEL}>
              What is it for
            </label>
            <select
              id="rental-occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className={FIELD}
            >
              <option value="">Select</option>
              {occasions.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rental-date" className={LABEL}>
              Date <span className="text-[color:var(--gp-gold-600)]">*</span>
            </label>
            <input
              id="rental-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rental-guests" className={LABEL}>
              How many guests
            </label>
            <select
              id="rental-guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className={FIELD}
            >
              <option value="">Select</option>
              {GUEST_BANDS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rental-budget" className={LABEL}>
              Budget per 24 hours, food included
            </label>
            <select
              id="rental-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={FIELD}
            >
              <option value="">Select</option>
              {BUDGET_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="rental-area" className={LABEL}>
            Preferred area
          </label>
          <select
            id="rental-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={FIELD}
          >
            <option value="">No preference</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rental-name" className={LABEL}>
              Name <span className="text-[color:var(--gp-gold-600)]">*</span>
            </label>
            <input id="rental-name" name="name" type="text" required autoComplete="name" className={FIELD} />
            {err("name") ? <p className="mt-1 text-[12px] text-red-700">{err("name")}</p> : null}
          </div>
          <PhoneField
            id="rental-phone"
            label="Phone"
            value={phone}
            onChange={setPhone}
            serverError={err("phone")}
          />
        </div>

        <div>
          <label htmlFor="rental-note" className={LABEL}>
            Anything else we should know
          </label>
          <textarea id="rental-note" name="note" rows={3} className={`${FIELD} py-3`} />
        </div>

        <label htmlFor="rental-consent" className="flex gap-2.5 border-t border-[color:var(--gp-border)] pt-4">
          <input
            id="rental-consent"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--gp-gold-600)]"
          />
          <span className="text-[13px] leading-relaxed text-[color:var(--gp-body)]">
            I consent to being contacted about this enquiry.{" "}
            <span className="text-[color:var(--gp-gold-600)]">*</span>
          </span>
        </label>
        {err("consent") ? <p className="text-[12px] text-red-700">{err("consent")}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Sending" : "Check Availability"}
        </button>

        <p className="text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
          Sending this does not hold the date. We check our own properties and the ones we let on
          owners&rsquo; behalf, come back with what is free and what it costs, and hold the date only
          once you confirm.
        </p>
      </form>
    </div>
  );
}
