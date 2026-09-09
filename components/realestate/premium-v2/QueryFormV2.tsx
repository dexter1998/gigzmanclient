"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { analytics } from "@/lib/analytics";
import { CLIENT_TYPE_LABELS } from "@/lib/format";
import { LeadIntent, PhoneField, SelectField } from "./LeadFields";

interface QueryFormV2Props {
  services: { slug: string; title: string }[];
  defaultService?: string;
  thankYouHref: string;
}

const INITIAL: QueryFormState = { ok: false };

/**
 * Same lead-capture logic as components/site/QueryForm.tsx (useActionState +
 * submitQuery, honeypot field, live phone validation via lib/phone) — only
 * the JSX/styling differs, restyled for the Premium V2 glass panel instead
 * of the CA vertical's plain bordered box.
 */
const FIELD =
  "w-full min-h-[48px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white/80 px-3.5 text-[14px] text-[color:var(--gp-ink)] placeholder:text-[color:var(--gp-muted)] transition-colors focus:border-[color:var(--gp-gold-600)] focus:bg-white focus:outline-none";

const LABEL = "mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]";

export default function QueryFormV2({ services, defaultService, thankYouHref }: QueryFormV2Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitQuery, INITIAL);
  const [started, setStarted] = useState(false);
  const [phone, setPhone] = useState("");
  const landingPage = useRef("");

  useEffect(() => {
    landingPage.current = window.location.pathname;
  }, []);

  useEffect(() => {
    if (state.ok && state.reference) {
      analytics.generateLead("contact_form", "website", defaultService);
      router.push(`${thankYouHref}?ref=${encodeURIComponent(state.reference)}`);
    }
  }, [state, router, thankYouHref, defaultService]);

  const onFirstInteraction = () => {
    if (started) return;
    setStarted(true);
    analytics.formStart("contact_form", "contact");
  };

  const err = (field: string) => state.errors?.[field];


  return (
    <form action={formAction} onFocus={onFirstInteraction} className="space-y-4" noValidate>
      <input type="hidden" name="landingPage" value={landingPage.current} />

      {/* Not shown to people; catches automated submissions. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company-v2">Company</label>
        <input id="company-v2" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && !state.ok ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-300)]/20 px-3.5 py-3 text-[13px] text-[color:var(--gp-ink)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="name-v2" className={LABEL}>
          Name <span className="text-[color:var(--gp-gold-600)]">*</span>
        </label>
        <input id="name-v2" name="name" type="text" required autoComplete="name" className={FIELD} />
        {err("name") ? <p className="mt-1 text-[12px] text-red-700">{err("name")}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PhoneField id="phone-v2" label="Phone" value={phone} onChange={setPhone} serverError={err("phone")} />
        <div>
          <label htmlFor="email-v2" className={LABEL}>
            Email
          </label>
          <input id="email-v2" name="email" type="email" inputMode="email" autoComplete="email" className={FIELD} />
          {err("email") ? <p className="mt-1 text-[12px] text-red-700">{err("email")}</p> : null}
        </div>
      </div>
      <p className="-mt-1 text-[12px] text-[color:var(--gp-muted)]">
        Provide at least one of phone or email so an advisor can respond.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField id="clientType-v2" name="clientType" label="You are" defaultValue="">
          <option value="">Select</option>
          {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>

      <LeadIntent idPrefix="contact" />

      {services.length > 0 ? (
        <div>
          <label htmlFor="service-v2" className={LABEL}>
            Requirement relates to
          </label>
          <select id="service-v2" name="service" defaultValue={defaultService ?? ""} className={FIELD}>
            <option value="">Select</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="message-v2" className={LABEL}>
          Brief description of the requirement
        </label>
        <textarea id="message-v2" name="note" rows={4} className={`${FIELD} py-3`} />
        {err("message") ? <p className="mt-1 text-[12px] text-red-700">{err("message")}</p> : null}
        <p className="mt-1.5 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
          Please do not include PAN, Aadhaar, passwords, OTPs, bank details or financial documents.
        </p>
      </div>

      <div className="space-y-3 border-t border-[color:var(--gp-border)] pt-4">
        <label htmlFor="consent-v2" className="flex gap-2.5">
          <input
            id="consent-v2"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--gp-gold-600)]"
          />
          <span className="text-[13px] leading-relaxed text-[color:var(--gp-body)]">
            I consent to being contacted about this enquiry using the details provided.{" "}
            <span className="text-[color:var(--gp-gold-600)]">*</span>
          </span>
        </label>
        {err("consent") ? <p className="text-[12px] text-red-700">{err("consent")}</p> : null}

        <label htmlFor="marketingConsent-v2" className="flex gap-2.5">
          <input
            id="marketingConsent-v2"
            name="marketingConsent"
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--gp-gold-600)]"
          />
          <span className="text-[13px] leading-relaxed text-[color:var(--gp-body)]">
            Optionally, send me market updates and new listings. This can be withdrawn at any time.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60 sm:w-auto"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Submitting" : "Submit Requirement"}
      </button>

      <p className="text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
        Submitting this form does not create any obligation. An advisor reviews the requirement and
        gets in touch through your preferred method.
      </p>
    </form>
  );
}
