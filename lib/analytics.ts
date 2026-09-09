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

  /**
   * Records that a calculation completed — never what it produced. `taxYear` is
   * nullable: not every calculator (e.g. EMI) is tied to a financial period.
   */
  calculatorComplete: (calculatorId: string, taxYear: string | null) =>
    track("calculator_complete", {
      calculator_id: calculatorId,
      tax_year: taxYear ?? undefined,
    }),

  calculatorLeadClick: (calculatorId: string, serviceId?: string) =>
    track("calculator_lead_click", { calculator_id: calculatorId, service_id: serviceId }),

  viewUpdate: (contentId: string, contentCategory: string) =>
    track("view_update", { content_id: contentId, content_category: contentCategory }),

  // ─────────────────────────────────────────────────── real-estate vertical

  viewProperty: (propertyId: string, propertyType: string) =>
    track("view_property", { property_id: propertyId, property_type: propertyType }),

  /**
   * Filter values only (type/purpose/locality/beds) — deliberately never a
   * price or budget figure, for the same reason a calculator result never
   * travels: a budget range is financial information about the visitor.
   */
  filterProperties: (filters: Record<string, string>) =>
    track("filter_properties", filters),

  viewLocality: (localitySlug: string) => track("view_locality", { locality_slug: localitySlug }),

  /** Location/type/budget-band filters only — same discipline as filterProperties. */
  searchSubmit: (pageType: string) => track("search_submit", { page_type: pageType }),

  shortlistRequest: (intent: string) => track("shortlist_request", { intent }),

  siteVisitRequest: (propertyId: string) => track("site_visit_request", { property_id: propertyId }),

  videoPlay: (videoId: string) => track("video_play", { video_id: videoId }),

  reportRequest: (reportId: string) => track("report_request", { report_id: reportId }),

  /* ───────────────────────────────── decision-making events
     Named against GA4's own recommended set where one fits (`generate_lead`,
     `qualify_lead`, `view_search_results`, `select_item`) and against the
     conventions real-estate guides use where GA4 has no equivalent
     (`property_search`, `valuation_submit`, `cta_click`). Using the
     recommended name matters: GA4's Lead Generation reports only populate
     from the events it recognises.

     The privacy rule above still applies, and it costs something here: guides
     recommend sending a price range with a property search, and this does
     not, because the file's existing discipline treats a visitor's budget as
     financial information about them. Enable it deliberately if the tradeoff
     is worth it — do not let it in by accident. */

  /** What a visitor is looking for. The single best signal of buying intent. */
  propertySearch: (params: {
    locality?: string;
    propertyType?: string;
    purpose?: string;
    beds?: number;
    pageType: string;
  }) =>
    track("property_search", {
      locality: params.locality,
      property_type: params.propertyType,
      purpose: params.purpose,
      beds: params.beds,
      page_type: params.pageType,
    }),

  /** Fires with the result count so zero-result searches are findable. */
  viewSearchResults: (resultCount: number, pageType: string) =>
    track("view_search_results", { result_count: resultCount, page_type: pageType }),

  /** A listing chosen out of a list — pairs with viewSearchResults. */
  selectListing: (propertyId: string, listPosition: number, listName: string) =>
    track("select_item", {
      property_id: propertyId,
      list_position: listPosition,
      list_name: listName,
    }),

  /**
   * Any CTA press. `ctaId` is a stable slug, not the button's label, so
   * renaming copy does not silently split a metric in two.
   */
  ctaClick: (ctaId: string, pageType: string, position: string) =>
    track("cta_click", { cta_id: ctaId, page_type: pageType, position }),

  /** Seller-side intent. Deliberately carries no address and no valuation. */
  valuationSubmit: (pageType: string) => track("valuation_submit", { page_type: pageType }),

  /**
   * GA4's recommended event for a lead that has shown it is worth working —
   * here, a lead that arrived with an identifiable intent (a bank page, a
   * specific property, a calculator) rather than a bare contact form.
   */
  qualifyLead: (intent: string, pageType: string) =>
    track("qualify_lead", { intent, page_type: pageType }),

  /**
   * Enhanced Measurement fires `scroll` once, at 90%, which cannot tell a page
   * that loses people at the fold from one that holds them to the last
   * section. These milestones can.
   */
  scrollMilestone: (percent: 25 | 50 | 75 | 90, pageType: string) =>
    track("scroll_milestone", { percent, page_type: pageType }),

  popupView: (popupId: string, intent: string, trigger: string) =>
    track("popup_view", { popup_id: popupId, intent, trigger }),

  popupDismiss: (popupId: string, intent: string, secondsOpen: number) =>
    track("popup_dismiss", { popup_id: popupId, intent, seconds_open: secondsOpen }),

  /** Requesting a callback — in Indian real estate this outsells email enquiry. */
  callRequestOpen: (source: string, pageType: string) =>
    track("call_request_open", { source, page_type: pageType }),

  callRequestSubmit: (source: string, pageType: string) =>
    track("call_request_submit", { source, page_type: pageType }),

  /* ───────────────────────────────── plot maps */

  viewMap: (mapSlug: string) => track("view_map", { map_slug: mapSlug }),

  /** Opening the full-screen map is the strongest signal on a map page. */
  mapFullscreen: (mapSlug: string) => track("map_fullscreen", { map_slug: mapSlug }),

  /** Sampled by the caller, not fired per wheel tick. */
  mapZoom: (mapSlug: string, zoomLevel: number) =>
    track("map_zoom", { map_slug: mapSlug, zoom_level: Math.round(zoomLevel * 10) / 10 }),

  compareLocalities: (count: number) => track("compare_localities", { count }),
};
