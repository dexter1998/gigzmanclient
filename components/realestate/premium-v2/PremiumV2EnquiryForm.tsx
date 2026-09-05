"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { analytics } from "@/lib/analytics";
import { checkPhone } from "@/lib/phone";
import { joinPath } from "@/lib/paths";

interface PremiumV2EnquiryFormProps {
  basePath: string;
  propertySlug: string;
  propertyId: string;
}

const INITIAL: QueryFormState = { ok: false };

const FIELD =
  "w-full min-h-[44px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3 text-[13.5px] text-[color:var(--gp-ink)] placeholder:text-[color:var(--gp-muted)] focus:border-[color:var(--gp-forest-900)] focus:outline-none";

/**
 * Same lead-capture logic as QueryForm (useActionState(submitQuery), the
 * honeypot field, live phone validation) restyled as a compact glass panel
 * for the property detail page. `service`/`calculatorId` don't map cleanly
 * onto a property enquiry (there's no service catalogue or calculator
 * involved), so this omits both fields and only carries `landingPage` plus a
 * `message` pre-filled with the property reference for context.
 */
export default function PremiumV2EnquiryForm({
  basePath,
  propertySlug,
  propertyId,
}: PremiumV2EnquiryFormProps) {
  const p = (path: string) => joinPath(basePath, path);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitQuery, INITIAL);
  const [started, setStarted] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const landingPage = useRef("");

  useEffect(() => {
    landingPage.current = window.location.pathname;
  }, []);

  useEffect(() => {
    if (state.ok && state.reference) {
      analytics.generateLead("property_enquiry_form", "website");
      analytics.siteVisitRequest(propertyId);
      router.push(`${p("/thank-you")}?ref=${encodeURIComponent(state.reference)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onFirstInteraction = () => {
    if (started) return;
    setStarted(true);
    analytics.formStart("property_enquiry_form", "property_detail");
  };

  const err = (field: string) => state.errors?.[field];
  const livePhoneError = phoneTouched && phone.trim() ? (checkPhone(phone).error ?? null) : null;

  return (
    <form action={formAction} onFocus={onFirstInteraction} className="space-y-3.5" noValidate>
      <input type="hidden" name="landingPage" value={landingPage.current} />
      <input type="hidden" name="message" value={`Enquiry about property: ${propertySlug}`} />

      {/* Not shown to people; catches automated submissions. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="gp-enquiry-company">Company</label>
        <input id="gp-enquiry-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && !state.ok ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[var(--gp-radius-sm)] bg-[#fbece9] px-3.5 py-3 text-[13px] text-[#c0392b]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="gp-enquiry-name" className="mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]">
          Name <span className="text-[color:var(--gp-gold-600)]">*</span>
        </label>
        <input
          id="gp-enquiry-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={FIELD}
        />
        {err("name") ? <p className="mt-1 text-[12px] text-[#c0392b]">{err("name")}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="gp-enquiry-phone" className="mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]">
            Phone
          </label>
          <input
            id="gp-enquiry-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={18}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            aria-invalid={Boolean(livePhoneError || err("phone"))}
            aria-describedby="gp-enquiry-phone-hint"
            className={FIELD}
          />
          <p id="gp-enquiry-phone-hint" className="mt-1 text-[12px] text-[#c0392b]">
            {livePhoneError || err("phone") || ""}
          </p>
        </div>
        <div>
          <label htmlFor="gp-enquiry-email" className="mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]">
            Email
          </label>
          <input
            id="gp-enquiry-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={FIELD}
          />
          {err("email") ? <p className="mt-1 text-[12px] text-[#c0392b]">{err("email")}</p> : null}
        </div>
      </div>
      <p className="-mt-1.5 text-[11.5px] text-[color:var(--gp-muted)]">
        Provide at least one of phone or email so the team can respond.
      </p>

      <div>
        <label htmlFor="gp-enquiry-preferred" className="mb-1.5 block text-[12.5px] font-medium text-[color:var(--gp-ink)]">
          Preferred contact method
        </label>
        <select id="gp-enquiry-preferred" name="preferredContact" defaultValue="" className={FIELD}>
          <option value="">No preference</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div className="space-y-2.5 border-t border-[color:var(--gp-border)] pt-3.5">
        <label htmlFor="gp-enquiry-consent" className="flex gap-2.5">
          <input
            id="gp-enquiry-consent"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--gp-forest-900)]"
          />
          <span className="text-[12.5px] leading-relaxed text-[color:var(--gp-body)]">
            I consent to being contacted about this enquiry using the details provided.{" "}
            <span className="text-[color:var(--gp-gold-600)]">*</span>
          </span>
        </label>
        {err("consent") ? <p className="text-[12px] text-[#c0392b]">{err("consent")}</p> : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Submitting" : "Send Enquiry"}
      </button>

      <p className="text-[11.5px] leading-relaxed text-[color:var(--gp-muted)]">
        Submitting this form does not create a professional relationship. Carpet area, price and
        possession timeline are confirmed by the developer before booking.
      </p>
    </form>
  );
}
