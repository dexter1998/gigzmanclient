/**
 * The loan-amount ladder for the home-loan pSEO pages.
 *
 * Rungs are the intersection of the ladders three ranking incumbents
 * actually publish (HDFC, NoBroker, Urban Money) — 5-lakh steps through the
 * lakh range, then the crore rungs each of them treats as a separate page.
 * The sub-10-lakh rungs NoBroker publishes are deliberately omitted: they are
 * national-volume plays with effectively no overlap with Gurugram ticket
 * sizes, so they would be pages this brokerage could never convert.
 */

export interface LoanAmount {
  /** URL segment, e.g. "50-lakh-home-loan-emi". */
  slug: string;
  /** Rupees. */
  value: number;
  /** "₹50 Lakh" — for headings and prose. */
  label: string;
  /** "50 lakh" — lowercase, for mid-sentence use and title tags. */
  plain: string;
}

const LAKH = 100_000;
const CRORE = 10_000_000;

const LAKH_RUNGS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

/** Crore rungs carry an explicit slug because "1.5" does not slugify cleanly. */
const CRORE_RUNGS: { n: number; slug: string; label: string; plain: string }[] = [
  { n: 1, slug: "1-crore", label: "₹1 Crore", plain: "1 crore" },
  { n: 1.5, slug: "1-5-crore", label: "₹1.5 Crore", plain: "1.5 crore" },
  { n: 2, slug: "2-crore", label: "₹2 Crore", plain: "2 crore" },
  { n: 3, slug: "3-crore", label: "₹3 Crore", plain: "3 crore" },
  { n: 4, slug: "4-crore", label: "₹4 Crore", plain: "4 crore" },
  { n: 5, slug: "5-crore", label: "₹5 Crore", plain: "5 crore" },
];

export const LOAN_AMOUNTS: LoanAmount[] = [
  ...LAKH_RUNGS.map((n) => ({
    slug: `${n}-lakh-home-loan-emi`,
    value: n * LAKH,
    label: `₹${n} Lakh`,
    plain: `${n} lakh`,
  })),
  ...CRORE_RUNGS.map((c) => ({
    slug: `${c.slug}-home-loan-emi`,
    value: c.n * CRORE,
    label: c.label,
    plain: c.plain,
  })),
];

/** Slug without the "-home-loan-emi" suffix — used for bank × amount URLs. */
export function amountSlugStem(amount: LoanAmount): string {
  return amount.slug.replace(/-home-loan-emi$/, "");
}

export function findAmountBySlug(slug: string): LoanAmount | undefined {
  return LOAN_AMOUNTS.find((a) => a.slug === slug);
}

export function findAmountByStem(stem: string): LoanAmount | undefined {
  return LOAN_AMOUNTS.find((a) => amountSlugStem(a) === stem);
}

/** Neighbouring rungs, for the "related amounts" interlink block. */
export function adjacentAmounts(amount: LoanAmount, span = 4): LoanAmount[] {
  const i = LOAN_AMOUNTS.findIndex((a) => a.slug === amount.slug);
  if (i === -1) return [];
  return LOAN_AMOUNTS.slice(Math.max(0, i - span), i + span + 1).filter((a) => a.slug !== amount.slug);
}
