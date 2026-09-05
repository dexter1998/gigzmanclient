/**
 * Lender directory for the home-loan pages.
 *
 * High Properties is an authorised DSA / channel partner, which is what makes
 * displaying lender marks and running "<bank> home loan in Gurugram" pages
 * legitimate here. Every page built from this data must still carry the
 * `LENDER_DISCLAIMER` below — the brokerage originates and assists, it does
 * not sanction, and sanction terms are always the lender's call.
 *
 * Rates and fees are deliberately OPTIONAL. They move constantly, and a stale
 * rate published as fact by a broker is a real liability — so a lender with
 * no verified figure renders an honest "current rate on request" rather than
 * a number nobody checked. `ratesAsOf` dates whatever is filled in.
 */

export interface Lender {
  slug: string;
  name: string;
  /** Short form for tight UI (table cells, chips). */
  shortName: string;
  kind: "bank" | "hfc";
  /** Filename stem under public/verticals/realestate/templates/premium-v2/bank-logos/ */
  logo: string;
  /** Most marks are SVG; a few lenders only publish a raster wordmark. */
  logoExt?: "svg" | "png";
  /**
   * True when the only mark the lender publishes is a white/reverse version,
   * which disappears on the cream chips used elsewhere — those get a dark
   * chip instead. Bajaj Housing Finance ships reverse-only.
   */
  logoNeedsDarkBg?: boolean;
  /** Starting floating rate, % p.a. Undefined until verified from the lender. */
  rateFrom?: number;
  /** Free-text because lenders express this differently (% of loan, slab, or flat). */
  processingFee?: string;
  maxTenureYears?: number;
  /** ISO date the rate/fee above was read from the lender's own page. */
  ratesAsOf?: string;
}

export const LENDER_DISCLAIMER =
  "High Properties is an authorised channel partner and assists with documentation and application processing. We are not the lender. Sanction, interest rate, tenure and final terms are decided solely by the lending institution based on its own credit assessment. Rates shown are indicative and change without notice — confirm current terms with the lender before relying on them.";

/**
 * Rates and fees below were read on 2026-09-05 from each lender's OWN
 * published page. Where a lender's site was unreadable (SBI, Federal and
 * Bank of India bot-block; IDFC First, IndusInd and Yes Bank render rates
 * only in JS) the field is left undefined rather than filled from an
 * aggregator — third-party rate claims contradicted each other and several
 * were stale against the current 5.25% repo rate.
 *
 * Two lenders publish a benchmark but not the housing spread on top of it
 * (Bank of Baroda's BRLLR, PNB's RLLR), so their starting rate is also
 * undefined here.
 *
 * `rateFrom` is an advertised starting rate — a marketing floor for the
 * best-scoring applicant, not the rate a given borrower gets.
 */
const AS_OF = "2026-09-05";

export const LENDERS: Lender[] = [
  { slug: "hdfc-bank", name: "HDFC Bank", shortName: "HDFC", kind: "bank", logo: "hdfc-bank",
    rateFrom: 7.75, processingFee: "Up to 0.50% of the loan or ₹3,000, whichever is higher, plus taxes", maxTenureYears: 30, ratesAsOf: AS_OF },
  // SBI's rate pages 503 to every non-browser client; fee and tenure came
  // from their own FAQ, so those stand and only the rate is withheld.
  { slug: "sbi", name: "State Bank of India", shortName: "SBI", kind: "bank", logo: "sbi",
    processingFee: "0.35% of the loan plus GST, minimum ₹2,000 and maximum ₹10,000", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "icici-bank", name: "ICICI Bank", shortName: "ICICI", kind: "bank", logo: "icici-bank",
    rateFrom: 8.5, processingFee: "0.50% of the loan plus taxes", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "axis-bank", name: "Axis Bank", shortName: "Axis", kind: "bank", logo: "axis-bank",
    rateFrom: 8.0, processingFee: "Up to 1% of the loan or ₹10,000, whichever is higher, plus GST", maxTenureYears: 30, ratesAsOf: AS_OF },
  // Publishes a BRLLR-linked spread but not the BRLLR value itself.
  { slug: "bank-of-baroda", name: "Bank of Baroda", shortName: "BoB", kind: "bank", logo: "bank-of-baroda",
    processingFee: "0.50% up to ₹50L (min ₹8,500 / max ₹15,000); 0.25% above ₹50L (max ₹25,000)", maxTenureYears: 30, ratesAsOf: AS_OF },
  // RLLR is 8.10% but the housing-loan spread over it is not published.
  { slug: "pnb", name: "Punjab National Bank", shortName: "PNB", kind: "bank", logo: "pnb",
    processingFee: "0.35% of the loan, minimum ₹2,500 and maximum ₹15,000", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "kotak-mahindra-bank", name: "Kotak Mahindra Bank", shortName: "Kotak", kind: "bank", logo: "kotak-mahindra-bank",
    rateFrom: 7.6, processingFee: "Up to 2% plus taxes; flat ₹5,000 for women applicants", maxTenureYears: 25, ratesAsOf: AS_OF },
  { slug: "lic-housing-finance", name: "LIC Housing Finance", shortName: "LIC HFL", kind: "hfc", logo: "lic-housing-finance", logoExt: "png",
    rateFrom: 7.15, processingFee: "Slab-based, from ₹3,000 up to ₹50,000 plus GST", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "pnb-housing-finance", name: "PNB Housing Finance", shortName: "PNB Housing", kind: "hfc", logo: "pnb-housing-finance", logoExt: "png",
    rateFrom: 7.5, processingFee: "1% of the loan plus GST, minimum ₹10,000, payable at application", maxTenureYears: 30, ratesAsOf: AS_OF },
  // Publishes only the MITC legal ceiling (up to 7%), never a typical fee.
  { slug: "bajaj-housing-finance", name: "Bajaj Housing Finance", shortName: "Bajaj Housing", kind: "hfc", logo: "bajaj-housing-finance", logoExt: "png", logoNeedsDarkBg: true,
    rateFrom: 7.25, maxTenureYears: 32, ratesAsOf: AS_OF },
  { slug: "tata-capital", name: "Tata Capital", shortName: "Tata Capital", kind: "hfc", logo: "tata-capital",
    rateFrom: 8.0, processingFee: "Up to 3% plus GST", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "idfc-first-bank", name: "IDFC First Bank", shortName: "IDFC First", kind: "bank", logo: "idfc-first-bank",
    maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "canara-bank", name: "Canara Bank", shortName: "Canara", kind: "bank", logo: "canara-bank",
    rateFrom: 7.15, processingFee: "0.50% (min ₹1,500 / max ₹10,000) plus GST — 50% waiver until 30 Sep 2026", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "union-bank-of-india", name: "Union Bank of India", shortName: "Union Bank", kind: "bank", logo: "union-bank-of-india",
    rateFrom: 7.15, maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "federal-bank", name: "Federal Bank", shortName: "Federal", kind: "bank", logo: "federal-bank",
    maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "indusind-bank", name: "IndusInd Bank", shortName: "IndusInd", kind: "bank", logo: "indusind-bank",
    maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "aavas-financiers", name: "Aavas Financiers", shortName: "Aavas", kind: "hfc", logo: "aavas-financiers" },
  { slug: "iifl-home-finance", name: "IIFL Home Finance", shortName: "IIFL", kind: "hfc", logo: "iifl-home-finance" },
  { slug: "lt-finance", name: "L&T Finance", shortName: "L&T", kind: "hfc", logo: "lt-finance",
    rateFrom: 7.75, processingFee: "Up to 3% plus taxes", maxTenureYears: 30, ratesAsOf: AS_OF },
  { slug: "godrej-housing-finance", name: "Godrej Housing Finance", shortName: "Godrej HF", kind: "hfc", logo: "godrej-housing-finance", logoExt: "png",
    rateFrom: 7.6, maxTenureYears: 30, ratesAsOf: AS_OF },
];

export const LOGO_BASE = "/verticals/realestate/templates/premium-v2/bank-logos";

export function lenderLogoSrc(lender: Lender): string {
  return `${LOGO_BASE}/${lender.logo}.${lender.logoExt ?? "svg"}`;
}

export function findLender(slug: string): Lender | undefined {
  return LENDERS.find((l) => l.slug === slug);
}

/** The rate used for on-page EMI maths when a lender has no verified rate. */
export const INDICATIVE_RATE = 8.5;

/**
 * Rate to compute with, and whether it is this lender's own published figure
 * or the generic indicative rate. Callers must surface the difference — an
 * estimate built on the indicative rate cannot be labelled as the lender's.
 */
export function rateFor(lender?: Lender): { rate: number; isLenderPublished: boolean } {
  if (lender?.rateFrom) return { rate: lender.rateFrom, isLenderPublished: true };
  return { rate: INDICATIVE_RATE, isLenderPublished: false };
}
