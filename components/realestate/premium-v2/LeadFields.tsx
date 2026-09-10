"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, Phone, Check } from "lucide-react";
import { checkPhone } from "@/lib/phone";
import { BUDGET_BANDS, BUDGET_LABELS } from "@/lib/format";

/**
 * The fields every lead form on this site carries, so a query arrives with the
 * same shape whether it came from the scroll popup, a property page or the
 * contact page.
 *
 * Two things are deliberately shared rather than re-declared per form: the
 * "what are you looking for" list, because the dashboard groups on it; and the
 * phone control, because the register's audience types numbers a dozen
 * different ways and only one of them is worth storing.
 */

/** Site-wide. Changing this changes every form at once. */
export const INTEREST_OPTIONS = [
  { value: "buy_home", label: "Buy a home" },
  { value: "buy_plot", label: "Buy a plot" },
  { value: "commercial", label: "Commercial or office space" },
  { value: "investment", label: "Invest in property" },
  { value: "rent", label: "Rent a property" },
  { value: "sell", label: "Sell or lease out my property" },
  { value: "site_visit", label: "Book a site visit" },
  { value: "exploring", label: "Just exploring" },
] as const;

export const INTEREST_LABELS: Record<string, string> = Object.fromEntries(
  INTEREST_OPTIONS.map((o) => [o.value, o.label]),
);

export const LEAD_FIELD =
  "w-full min-h-[46px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3.5 " +
  "text-[13.5px] text-[color:var(--gp-ink)] placeholder:text-[color:var(--gp-muted)] " +
  "focus:border-[color:var(--gp-gold-600)] focus:outline-none";

const LABEL = "mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]";

/**
 * A native select paints its arrow hard against the right border and lets the
 * label run underneath it. Same treatment as the property filters: strip the
 * native control and reserve the room back.
 */
export function SelectField({
  id,
  name,
  label,
  required,
  defaultValue,
  value,
  onChange,
  srLabel,
  children,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  /** Hide the visible label (the popup is tight on space). */
  srLabel?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={srLabel ? "sr-only" : LABEL}>
        {label} {required && !srLabel ? <span className="text-[color:var(--gp-gold-600)]">*</span> : null}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={onChange ? undefined : defaultValue}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={`${LEAD_FIELD} appearance-none truncate pr-10`}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--gp-muted)]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/**
 * Ten digits, nothing else. The +91 sits outside the input as a fixed prefix so
 * nobody types it in and then fails the length check — that was the single
 * commonest way this field was filled in wrong.
 */
export function PhoneField({
  id,
  label = "Mobile number",
  required,
  srLabel,
  serverError,
  value,
  onChange,
}: {
  id: string;
  label?: string;
  required?: boolean;
  srLabel?: boolean;
  serverError?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [touched, setTouched] = useState(false);
  const liveError = touched && value.trim() ? (checkPhone(value).error ?? null) : null;
  const valid = value.trim() ? checkPhone(value).valid : false;
  const error = liveError || serverError;

  return (
    <div>
      <label htmlFor={id} className={srLabel ? "sr-only" : LABEL}>
        {label} {required && !srLabel ? <span className="text-[color:var(--gp-gold-600)]">*</span> : null}
      </label>
      <div
        className={`flex min-h-[46px] items-stretch overflow-hidden rounded-[var(--gp-radius-sm)] border bg-white ${
          error ? "border-[color:var(--color-status-danger)]" : "border-[color:var(--gp-border)]"
        } focus-within:border-[color:var(--gp-gold-600)]`}
      >
        <span className="flex shrink-0 select-none items-center border-r border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] px-3 text-[13.5px] font-medium text-[color:var(--gp-body)]">
          +91
        </span>
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required={required}
          maxLength={10}
          placeholder="10-digit number"
          value={value}
          // Digits only: pasting "+91 98215 53693" should still leave 10 digits.
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(-10))}
          onBlur={() => setTouched(true)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-[13.5px] text-[color:var(--gp-ink)] placeholder:text-[color:var(--gp-muted)] focus:outline-none"
        />
        {valid ? (
          <span className="flex shrink-0 items-center pr-3">
            <Check className="h-4 w-4 text-[color:var(--gp-success)]" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p
        id={`${id}-hint`}
        className={`mt-1 text-[11.5px] ${error ? "text-[color:var(--color-status-danger)]" : "text-[color:var(--gp-muted)]"}`}
      >
        {error || "Enter the 10 digits only — no +91 or spaces."}
      </p>
    </div>
  );
}

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "phone", label: "Phone call", icon: Phone },
] as const;

/**
 * How they want to be reached. Both are on by default because both are how this
 * team actually follows up; turning one off is the deliberate act.
 *
 * `preferredContact` is a single-value enum in the database, so the hidden
 * input carries the first choice and the readable list goes into the message —
 * nothing about the selection is lost.
 */
export function ContactChannels({
  value,
  onChange,
  label = "How should we reach you?",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  label?: string;
}) {
  const toggle = (channel: string) => {
    const next = value.includes(channel)
      ? value.filter((v) => v !== channel)
      : [...value, channel];
    // One has to stay on — an enquiry with no way to answer it is not a lead.
    if (next.length === 0) return;
    onChange(next);
  };

  return (
    <div>
      <p className={LABEL}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((c) => {
          const active = value.includes(c.value);
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(c.value)}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
                active
                  ? "border-[color:var(--gp-gold-600)] bg-[color:var(--gp-gold-600)] text-[color:var(--gp-forest-950)]"
                  : "border-[color:var(--gp-border)] bg-white text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)]"
              }`}
            >
              <c.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {c.label}
              {active ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <input type="hidden" name="preferredContact" value={value[0] ?? "phone"} />
    </div>
  );
}

/** The one line the dashboard reads to know what this lead is about. */
export function composeMessage({
  interest,
  context,
  channels,
  note,
  budget,
}: {
  interest: string;
  context?: string;
  channels: string[];
  note?: string;
  budget?: string;
}): string {
  const parts = [
    `Looking for: ${INTEREST_LABELS[interest] ?? "Not specified"}`,
    // Folded into the message rather than given its own column: the leads
    // table has no budget field, and adding one would mean migrating
    // production before the next deploy could ship.
    budget ? `Budget: ${BUDGET_LABELS[budget] ?? budget}` : null,
    context ? `About: ${context}` : null,
    channels.length ? `Reach via: ${channels.map((c) => (c === "whatsapp" ? "WhatsApp" : "Phone call")).join(", ")}` : null,
    note?.trim() ? `Note: ${note.trim()}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/**
 * Interest + channels together, with the composed message as a hidden input.
 * `context` is what the lead was looking at — a project, a sector, a developer —
 * so an enquiry never arrives without saying what prompted it.
 */
export function LeadIntent({
  idPrefix,
  context,
  defaultInterest = "",
  label = "What are you looking for?",
}: {
  idPrefix: string;
  context?: string;
  defaultInterest?: string;
  label?: string;
}) {
  const [interest, setInterest] = useState(defaultInterest);
  const [budget, setBudget] = useState("");
  const [channels, setChannels] = useState<string[]>(["whatsapp", "phone"]);

  return (
    <>
      <SelectField
        id={`${idPrefix}-interest`}
        name="interest"
        label={label}
        required
        value={interest}
        onChange={setInterest}
      >
        <option value="" disabled>
          Select an option
        </option>
        {INTEREST_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>

      {/* Optional on purpose. A required budget is the field people abandon
          a form on, and an advisor can ask on the call — but most leads
          answer it, and one that arrives with a band attached can be routed
          to matching inventory before anyone picks up the phone. */}
      <SelectField
        id={`${idPrefix}-budget`}
        name="budget"
        label="Budget (optional)"
        value={budget}
        onChange={setBudget}
      >
        <option value="">Not sure yet</option>
        {BUDGET_BANDS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </SelectField>

      <ContactChannels value={channels} onChange={setChannels} />

      <input
        type="hidden"
        name="message"
        value={composeMessage({ interest, context, channels, budget })}
      />
      {context ? <input type="hidden" name="intentContext" value={context} /> : null}
    </>
  );
}
