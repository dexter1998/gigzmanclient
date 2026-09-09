"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitQuery } from "@/lib/actions/submit-query";
import { checkPhone } from "@/lib/phone";
import { calculateEmi, EMI_VERSION } from "@/lib/calculators/emi";
import { calculateRentalYield, RENTAL_YIELD_VERSION } from "@/lib/calculators/rental-yield";
import { EMI_RATE_PRESETS, EMI_TENURE_PRESETS_YEARS } from "@/lib/calculators/rates/gurugram-2026";
import { PROPERTY_TYPE_LABELS, formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { GpEyebrow, cn } from "./gp-primitives";
import RelatedCardsV2 from "./RelatedCardsV2";
import { TOOL_ICONS } from "./toolIcons";

interface CalculatorsV2Props {
  contactHref: string;
  advisorName: string;
  /** The published tool pages, from lib/premium-v2/tools.ts. */
  tools: { key: string; label: string; blurb: string; href: string }[];
}

const FIELD_LIGHT =
  "min-h-[46px] w-full rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3.5 text-[13.5px] text-[color:var(--gp-ink)] transition-colors focus:border-[color:var(--gp-gold-600)] focus:outline-none";

const FIELD_DARK =
  "min-h-[46px] w-full rounded-[var(--gp-radius-sm)] border border-white/15 bg-white/[0.06] px-3.5 text-[13.5px] text-white placeholder:text-white/35 transition-colors focus:border-[color:var(--gp-gold-300)] focus:outline-none";

const LABEL_LIGHT = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]";
const LABEL_DARK = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50";

// ─────────────────────────────────────────────────────── valuation panel

type ValuationStep = "form" | "success";

function ValuationPanel({
  contactHref,
  advisorName,
}: Pick<CalculatorsV2Props, "contactHref" | "advisorName">) {
  const [step, setStep] = useState<ValuationStep>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [locality, setLocality] = useState("");
  const [beds, setBeds] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const phoneCheck = phone.trim() ? checkPhone(phone) : null;

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart("valuation-flow", "1");
  };

  const submitValuation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || !phoneCheck?.valid) {
      setPhoneTouched(true);
      return;
    }
    if (!consent) {
      setError("Please confirm consent to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("phone", phone);
    formData.set("clientType", "individual");
    formData.set("preferredContact", "phone");
    formData.set(
      "message",
      `Free valuation request${propertyType ? ` for a ${PROPERTY_TYPE_LABELS[propertyType] ?? propertyType}` : ""}${locality ? ` in ${locality}` : ""}${beds ? `, ${beds} BHK` : ""}.`,
    );
    formData.set("consent", "on");
    formData.set("marketingConsent", "off");
    formData.set("calculatorId", "valuation");
    formData.set("landingPage", typeof window !== "undefined" ? window.location.pathname : "");

    const result = await submitQuery({ ok: false }, formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? "Something went wrong. Please try again.");
      return;
    }

    analytics.calculatorComplete("valuation", null);
    setStep("success");
  };

  return (
    <div
      className="flex flex-col rounded-[var(--gp-radius-lg)] border-2 border-[color:var(--gp-gold-600)] p-7"
      style={{ background: "var(--gp-gradient-glass)" }}
    >
      <GpEyebrow>Free Property Valuation</GpEyebrow>
      <h3 className="font-display mt-2 text-[18px] text-[color:var(--gp-ink)]">
        What&rsquo;s Your Property Worth?
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-muted)]">
        One quick step. A dedicated advisor reviews every request personally.
      </p>

      {step === "form" ? (
        <form onSubmit={submitValuation} className="mt-6 space-y-4">
          <div>
            <label className={LABEL_LIGHT} htmlFor="gp-val-name">
              Your Name
            </label>
            <input
              id="gp-val-name"
              value={name}
              onFocus={touch}
              onChange={(e) => setName(e.target.value)}
              className={FIELD_LIGHT}
              required
            />
          </div>
          <div>
            <label className={LABEL_LIGHT} htmlFor="gp-val-phone">
              Phone Number
            </label>
            <input
              id="gp-val-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onFocus={touch}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              className={FIELD_LIGHT}
              required
            />
            {phoneTouched && phone.trim() && !phoneCheck?.valid ? (
              <p className="mt-1 text-[11.5px] text-status-danger">{phoneCheck?.error}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_LIGHT} htmlFor="gp-val-type">
              Property Type
            </label>
            <select
              id="gp-val-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={FIELD_LIGHT}
            >
              <option value="">Select property type</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_LIGHT} htmlFor="gp-val-locality">
                Locality
              </label>
              <input
                id="gp-val-locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className={FIELD_LIGHT}
                placeholder="e.g. Sector 54"
              />
            </div>
            <div>
              <label className={LABEL_LIGHT} htmlFor="gp-val-beds">
                Configuration
              </label>
              <select
                id="gp-val-beds"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className={FIELD_LIGHT}
              >
                <option value="">Any BHK</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} BHK
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="gp-val-consent" className="flex gap-2.5">
            <input
              id="gp-val-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
              required
            />
            <span className="text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
              I consent to being contacted about this valuation request.
            </span>
          </label>

          {error ? <p className="text-[12px] text-status-danger">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Submitting" : "Get My Valuation"}
          </button>
        </form>
      ) : null}

      {step === "success" ? (
        <div className="mt-8 flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
          <p className="font-display mt-4 text-[15px] text-[color:var(--gp-ink)]">Request Received</p>
          <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
            Thanks — your valuation request has been assigned to <strong>{advisorName}</strong>, who
            will reach out shortly.
          </p>
          <a
            href={contactHref}
            className="mt-5 text-[12.5px] font-semibold text-[color:var(--gp-gold-600)] underline underline-offset-2"
          >
            Have a question in the meantime? Contact us
          </a>
        </div>
      ) : null}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── export

export default function CalculatorsV2({ contactHref, advisorName, tools }: CalculatorsV2Props) {
  return (
    <section className="gp-section bg-tint">
      <div className="gp-container">
        <GpEyebrow>Tools for Your Decision</GpEyebrow>
        <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
          Calculate Before You Commit
        </h2>

        {/* The EMI and rental-yield panels that used to sit beside the
            valuation form were the first-generation calculators; both now
            have their own pages in the current design, so this links out to
            them rather than shipping a second, older copy on the home page. */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <ValuationPanel contactHref={contactHref} advisorName={advisorName} />
          <RelatedCardsV2
            items={tools.map((tool) => ({
              href: tool.href,
              title: tool.label,
              subtitle: tool.blurb,
              icon: TOOL_ICONS[tool.key],
            }))}
            columns={1}
            className="h-full [&>div]:mt-0 [&>div]:h-full [&>div]:auto-rows-fr [&_a]:items-center"
          />
        </div>
      </div>
    </section>
  );
}
