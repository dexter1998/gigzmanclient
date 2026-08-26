"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { analytics } from "@/lib/analytics";
import { CLIENT_TYPE_LABELS } from "@/lib/format";

interface QueryFormProps {
  services: { slug: string; title: string }[];
  defaultService?: string;
  calculatorId?: string;
  thankYouHref: string;
}

const INITIAL: QueryFormState = { ok: false };

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink placeholder:text-ink-subtle focus:border-navy focus:outline-none";

export default function QueryForm({
  services,
  defaultService,
  calculatorId,
  thankYouHref,
}: QueryFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitQuery, INITIAL);
  const [started, setStarted] = useState(false);
  const landingPage = useRef("");

  useEffect(() => {
    landingPage.current = window.location.pathname;
  }, []);

  useEffect(() => {
    if (state.ok && state.reference) {
      analytics.generateLead(
        calculatorId ? "calculator_cta" : "contact_form",
        calculatorId ? "calculator" : "website",
        defaultService,
      );
      router.push(`${thankYouHref}?ref=${encodeURIComponent(state.reference)}`);
    }
  }, [state, router, thankYouHref, calculatorId, defaultService]);

  const onFirstInteraction = () => {
    if (started) return;
    setStarted(true);
    analytics.formStart(calculatorId ? "calculator_cta" : "contact_form", "contact");
  };

  const err = (field: string) => state.errors?.[field];

  return (
    <form action={formAction} onFocus={onFirstInteraction} className="space-y-4" noValidate>
      <input type="hidden" name="landingPage" value={landingPage.current} />
      {calculatorId ? <input type="hidden" name="calculatorId" value={calculatorId} /> : null}

      {/* Not shown to people; catches automated submissions. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && !state.ok ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[8px] bg-status-danger-soft px-3.5 py-3 text-[13px] text-status-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-ink">
          Name <span className="text-accent">*</span>
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={FIELD} />
        {err("name") ? <p className="mt-1 text-[12px] text-status-danger">{err("name")}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-[13px] font-medium text-ink">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={FIELD}
          />
          {err("phone") ? (
            <p className="mt-1 text-[12px] text-status-danger">{err("phone")}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={FIELD}
          />
          {err("email") ? (
            <p className="mt-1 text-[12px] text-status-danger">{err("email")}</p>
          ) : null}
        </div>
      </div>
      <p className="-mt-1 text-[12px] text-ink-subtle">
        Provide at least one of phone or email so the firm can respond.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clientType" className="mb-1.5 block text-[13px] font-medium text-ink">
            You are
          </label>
          <select id="clientType" name="clientType" defaultValue="" className={FIELD}>
            <option value="">Select</option>
            {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="service" className="mb-1.5 block text-[13px] font-medium text-ink">
            Requirement relates to
          </label>
          <select id="service" name="service" defaultValue={defaultService ?? ""} className={FIELD}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="preferredContact" className="mb-1.5 block text-[13px] font-medium text-ink">
          Preferred contact method
        </label>
        <select id="preferredContact" name="preferredContact" defaultValue="" className={FIELD}>
          <option value="">No preference</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium text-ink">
          Brief description of the requirement
        </label>
        <textarea id="message" name="message" rows={4} className={`${FIELD} py-2.5`} />
        {err("message") ? (
          <p className="mt-1 text-[12px] text-status-danger">{err("message")}</p>
        ) : null}
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-subtle">
          Please do not include PAN, Aadhaar, passwords, OTPs, bank details or financial documents.
        </p>
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <label htmlFor="consent" className="flex gap-2.5">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f2744]"
          />
          <span className="text-[13px] leading-relaxed text-ink-muted">
            I consent to being contacted about this enquiry using the details provided.{" "}
            <span className="text-accent">*</span>
          </span>
        </label>
        {err("consent") ? (
          <p className="text-[12px] text-status-danger">{err("consent")}</p>
        ) : null}

        <label htmlFor="marketingConsent" className="flex gap-2.5">
          <input
            id="marketingConsent"
            name="marketingConsent"
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f2744]"
          />
          <span className="text-[13px] leading-relaxed text-ink-muted">
            Optionally, send me professional updates. This can be withdrawn at any time.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft disabled:opacity-60 sm:w-auto"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Submitting" : "Submit Requirement"}
      </button>

      <p className="text-[12px] leading-relaxed text-ink-subtle">
        Submitting this form does not create a professional relationship. An engagement begins only
        after the requirement is reviewed and terms are agreed in writing.
      </p>
    </form>
  );
}
