/**
 * Rate tables for the calculators.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOT VERIFIED. `reviewed` is false and every calculator seeded from this file
 * carries the `ca_review_required` status, which renders a visible banner on the
 * public site.
 *
 * These figures reflect the structure introduced by the Finance Act 2025 and
 * have NOT been checked against any amendment applying to FY 2026-27. Before a
 * calculator is promoted to `active` from the dashboard, every value below must
 * be confirmed against the Finance Act in force and `reviewed` set to true with
 * the reviewer recorded.
 *
 * Rate tables live in code rather than the database deliberately: the dashboard
 * controls a calculator's status and disclaimer, not its formula.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const RATES_VERSION = "2026-27.1";
export const TAX_YEAR = "FY 2026-27 (AY 2027-28)";
export const REVIEWED = false;

export type Slab = { upTo: number | null; rate: number };

/** Ordered ascending; `upTo: null` is the final open-ended slab. */
export const NEW_REGIME_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: null, rate: 0.3 },
];

export const OLD_REGIME_SLABS = {
  /** Below 60 years of age. */
  general: [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: null, rate: 0.3 },
  ] as Slab[],
  /** 60 years or above, below 80. */
  senior: [
    { upTo: 300000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: null, rate: 0.3 },
  ] as Slab[],
  /** 80 years or above. */
  superSenior: [
    { upTo: 500000, rate: 0 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: null, rate: 0.3 },
  ] as Slab[],
};

export const STANDARD_DEDUCTION = {
  new: 75000,
  old: 50000,
};

/** Section 87A rebate — applied against tax before surcharge and cess. */
export const REBATE_87A = {
  new: { incomeLimit: 1200000, maxRebate: 60000 },
  old: { incomeLimit: 500000, maxRebate: 12500 },
};

export type SurchargeBand = { above: number; rate: number };

export const SURCHARGE_BANDS = {
  /** The new regime caps surcharge at 25%. */
  new: [
    { above: 5000000, rate: 0.1 },
    { above: 10000000, rate: 0.15 },
    { above: 20000000, rate: 0.25 },
  ] as SurchargeBand[],
  old: [
    { above: 5000000, rate: 0.1 },
    { above: 10000000, rate: 0.15 },
    { above: 20000000, rate: 0.25 },
    { above: 50000000, rate: 0.37 },
  ] as SurchargeBand[],
};

export const CESS_RATE = 0.04;

/** Deduction ceilings used to cap user input under the old regime. */
export const DEDUCTION_LIMITS = {
  section80C: 150000,
  section80D: 100000,
  section80CCD1B: 50000,
  section80TTA: 10000,
  section80TTB: 50000,
};

export type TdsSection = {
  code: string;
  label: string;
  /** Aggregate annual threshold below which no deduction is required. */
  threshold: number;
  residentRate: number;
  /** Applied where PAN is unavailable. */
  noPanRate: number;
  note?: string;
};

export const TDS_SECTIONS: TdsSection[] = [
  {
    code: "192A",
    label: "Premature withdrawal from provident fund",
    threshold: 50000,
    residentRate: 0.1,
    noPanRate: 0.2,
  },
  {
    code: "194A",
    label: "Interest other than interest on securities",
    threshold: 40000,
    residentRate: 0.1,
    noPanRate: 0.2,
    note: "A higher threshold applies where the recipient is a senior citizen.",
  },
  {
    code: "194C",
    label: "Payment to contractors",
    threshold: 100000,
    residentRate: 0.02,
    noPanRate: 0.2,
    note: "A rate of 1% applies where the payee is an individual or Hindu undivided family. Single-payment and aggregate thresholds differ.",
  },
  {
    code: "194H",
    label: "Commission or brokerage",
    threshold: 20000,
    residentRate: 0.05,
    noPanRate: 0.2,
  },
  {
    code: "194I(a)",
    label: "Rent — plant and machinery",
    threshold: 240000,
    residentRate: 0.02,
    noPanRate: 0.2,
  },
  {
    code: "194I(b)",
    label: "Rent — land, building or furniture",
    threshold: 240000,
    residentRate: 0.1,
    noPanRate: 0.2,
  },
  {
    code: "194J",
    label: "Professional or technical services",
    threshold: 30000,
    residentRate: 0.1,
    noPanRate: 0.2,
    note: "A rate of 2% applies to fees for technical services and to certain call-centre operations.",
  },
  {
    code: "194Q",
    label: "Purchase of goods",
    threshold: 5000000,
    residentRate: 0.001,
    noPanRate: 0.05,
  },
];

/** GST rates are selected by the user; the calculator never infers classification. */
export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];
