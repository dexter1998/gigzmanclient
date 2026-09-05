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
} as const satisfies Record<string, LeadPopupIntent>;

export type LeadIntentKey = keyof typeof LEAD_INTENTS;

/** Opens ScrollLeadPopupV2 from anywhere in the tree without prop-drilling or
 * a Context provider — a plain DOM event keeps every "Book Consultation" CTA
 * (many of them in Server Components) a simple import, not a client wrapper
 * threaded through the whole page tree. */
export function openLeadPopup(intent: LeadIntentKey = "default") {
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_POPUP_EVENT, { detail: { intent } }));
}
