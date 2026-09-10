export const OPEN_LEAD_POPUP_EVENT = "gp:open-lead-popup";

/**
 * Copy shown in the popup, chosen by where it was opened from. A lead that
 * arrives from a bank eligibility page wants different reassurance than one
 * from a generic CTA, and the message is also carried into the enquiry so the
 * advisor knows what the person was actually looking at.
 */
export interface LeadPopupIntent {
  eyebrow: string;
  heading: string;
  blurb: string;
  /** Written into the enquiry body so the advisor sees the context. */
  context: string;
}

export const LEAD_INTENTS = {
  default: {
    eyebrow: "Still looking?",
    heading: "Let\u2019s find what fits.",
    blurb: "Leave your details and a Gurugram property expert will call you back.",
    context: "General enquiry.",
  },
  bank: {
    eyebrow: "Check your eligibility",
    heading: "We need a few details for your eligibility.",
    blurb: "Share them and an advisor will come back with an indicative eligibility for this lender.",
    context: "Home loan eligibility enquiry.",
  },
  homeLoan: {
    eyebrow: "Your EMI estimate is ready",
    heading: "Our expert will call you for better guidance.",
    blurb: "An advisor will walk you through the numbers, what you qualify for, and what it buys in Gurugram.",
    context: "Home loan EMI calculation enquiry.",
  },
  calculator: {
    eyebrow: "Your estimate is ready",
    heading: "Our expert will call you for better guidance.",
    blurb: "An advisor will talk through what these numbers mean for your specific property.",
    context: "Calculator enquiry.",
  },
  /**
   * The plain "call me back" ask. In Indian real estate this is the path most
   * buyers actually use — they want a person on the phone, not an email
   * thread — so it is its own intent rather than folded into `default`, and
   * it reports separately (`call_request_open` / `call_request_submit`) so its
   * volume is not hidden inside generic enquiries.
   */
  callback: {
    eyebrow: "Prefer to talk?",
    heading: "We’ll call you back.",
    blurb: "Leave a number and a Gurugram advisor will call you — no email thread, no obligation.",
    context: "Callback request.",
  },
  /** Opened from a plot-map page: the question is almost always about a plot. */
  map: {
    eyebrow: "Looking at this sector?",
    heading: "Ask us what’s actually available here.",
    blurb: "Tell us the plot size or block you are looking at and an advisor will call with what is on the market.",
    context: "Plot map enquiry.",
  },
  property: {
    eyebrow: "Interested in this property?",
    heading: "Get the full details and a site visit.",
    blurb: "An advisor will confirm availability, the current asking price and arrange a visit.",
    context: "Property enquiry.",
  },
  /**
   * Every service CTA on the property-management page opens the popup with
   * this intent rather than scrolling to the form at the bottom — an owner
   * who clicks "raise a request" or "start tenant search" halfway down the
   * page has already decided, and sending them looking for a form loses
   * them. The consultation section keeps its own inline form for people who
   * arrive at the bottom still reading.
   */
  propertyManagement: {
    eyebrow: "Property management",
    heading: "Tell us about your property.",
    blurb:
      "Share a few details and a property-management advisor will call you with a plan for tenants, rent and upkeep.",
    context: "Property management enquiry.",
  },
  /**
   * Seller-side, from the header strip. Everything else in this list is a
   * buyer or an owner asking for a service; this is someone with inventory,
   * and the copy has to say what happens next or it reads as another
   * "book a consultation".
   */
  postProperty: {
    eyebrow: "List with us",
    heading: "Post your property.",
    blurb:
      "Tell us what you are selling or letting. An advisor will confirm the details, agree a price band with you and put it in front of matched buyers.",
    context: "Post property enquiry.",
  },
} as const satisfies Record<string, LeadPopupIntent>;

export type LeadIntentKey = keyof typeof LEAD_INTENTS;

/** Opens ScrollLeadPopupV2 from anywhere in the tree without prop-drilling or
 * a Context provider — a plain DOM event keeps every "Book Consultation" CTA
 * (many of them in Server Components) a simple import, not a client wrapper
 * threaded through the whole page tree. */
export function openLeadPopup(intent: LeadIntentKey = "default") {
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_POPUP_EVENT, { detail: { intent } }));
}
