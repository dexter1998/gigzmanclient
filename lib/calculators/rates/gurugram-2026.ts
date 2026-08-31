/**
 * Rate tables for the real-estate calculators.
 * ─────────────────────────────────────────────────────────────────────────────
 * NOT VERIFIED. `reviewed` is false and every calculator seeded from this file
 * carries the `ca_review_required` status (renamed nowhere — the calculators
 * table's status enum is shared across verticals), which renders the same
 * visible "rates awaiting professional verification" banner used on the CA
 * vertical's calculators.
 *
 * Stamp duty and registration figures reflect Haryana / Gurugram (HRERA
 * jurisdiction) as a representative structure for the demo template — they
 * have NOT been checked against the current notification in force and must
 * not be relied on. Before a calculator is promoted to `active` from the
 * dashboard, every value below must be confirmed against the state
 * notification in force and `reviewed` set to true with the reviewer
 * recorded.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const RATES_VERSION = "gurugram-2026.1";
export const REVIEWED = false;

/** Percent of the property's circle-rate/agreement value, whichever is higher. */
export const STAMP_DUTY_RATES: Record<"male" | "female" | "joint", number> = {
  male: 0.07,
  female: 0.05,
  joint: 0.06,
};

/** Registration fee: 1% of value, capped. */
export const REGISTRATION_FEE_RATE = 0.01;
export const REGISTRATION_FEE_CAP = 15_000;

/** Typical bank home-loan interest rate band shown as presets, not a quote. */
export const EMI_RATE_PRESETS = [8.0, 8.5, 9.0, 9.5, 10.0];
export const EMI_TENURE_PRESETS_YEARS = [5, 10, 15, 20, 25, 30];

/** Assumed recurring costs deducted for the net rental yield, as a % of annual rent. */
export const NET_YIELD_EXPENSE_RATIO = 0.1;
