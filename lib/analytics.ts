/**
 * GA4 helpers.
 *
 * Nothing identifying or financial is permitted in an event payload: no name,
 * phone, email, message text, PAN, income, tax amount or calculator result.
 * Services and calculators are referenced by their stable slug only.
 */

type Primitive = string | number | boolean | undefined;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, Primitive>) => void;
    dataLayer?: unknown[];
  }
}

/** Blocked outright rather than sanitised, so a mistake fails loudly in development. */
const FORBIDDEN_KEYS = new Set([
  "name",
  "phone",
  "email",
  "message",
  "pan",
  "aadhaar",
  "income",
  "salary",
  "tax",
  "tax_amount",
  "amount",
  "value_inr",
  "result",
  "gross_income",
  "taxable_income",
]);

function assertSafe(params: Record<string, Primitive>): Record<string, Primitive> {
  const safe: Record<string, Primitive> = {};

  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`[analytics] Refused to send "${key}" — identifying or financial data.`);
      }
      continue;
    }
    if (value !== undefined) safe[key] = value;
  }

  return safe;
}

function track(eventName: string, params: Record<string, Primitive> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, assertSafe(params));
}

export const analytics = {
  viewService: (serviceId: string, serviceCategory: string) =>
    track("view_service", { service_id: serviceId, service_category: serviceCategory }),

  selectService: (serviceId: string, sectionId: string) =>
    track("select_service", { service_id: serviceId, section_id: sectionId }),

  formStart: (formId: string, pageType: string) =>
    track("form_start", { form_id: formId, page_type: pageType }),

  formSubmit: (formId: string, serviceId?: string) =>
    track("form_submit", { form_id: formId, service_id: serviceId }),

  /** Fires only after a query row has actually been created. */
  generateLead: (formId: string, leadSource: string, serviceId?: string) =>
    track("generate_lead", { form_id: formId, lead_source: leadSource, service_id: serviceId }),

  clickCall: (ctaPosition: string, pageType: string) =>
    track("click_call", { cta_position: ctaPosition, page_type: pageType }),

  clickWhatsapp: (ctaPosition: string, pageType: string) =>
    track("click_whatsapp", { cta_position: ctaPosition, page_type: pageType }),

  clickEmail: (ctaPosition: string, pageType: string) =>
    track("click_email", { cta_position: ctaPosition, page_type: pageType }),

  calculatorStart: (calculatorId: string, calculatorVersion: string) =>
    track("calculator_start", {
      calculator_id: calculatorId,
      calculator_version: calculatorVersion,
    }),

  /** Records that a calculation completed — never what it produced. */
  calculatorComplete: (calculatorId: string, taxYear: string) =>
    track("calculator_complete", { calculator_id: calculatorId, tax_year: taxYear }),

  calculatorLeadClick: (calculatorId: string, serviceId?: string) =>
    track("calculator_lead_click", { calculator_id: calculatorId, service_id: serviceId }),

  viewUpdate: (contentId: string, contentCategory: string) =>
    track("view_update", { content_id: contentId, content_category: contentCategory }),
};
