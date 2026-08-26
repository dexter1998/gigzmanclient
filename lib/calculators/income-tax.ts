import {
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  STANDARD_DEDUCTION,
  REBATE_87A,
  SURCHARGE_BANDS,
  CESS_RATE,
  DEDUCTION_LIMITS,
  RATES_VERSION,
  type Slab,
  type SurchargeBand,
} from "./rates/fy-2026-27";

export const INCOME_TAX_VERSION = RATES_VERSION;

export type AgeCategory = "general" | "senior" | "superSenior";

export interface IncomeTaxInput {
  ageCategory: AgeCategory;
  salaryIncome: number;
  housePropertyIncome: number;
  businessIncome: number;
  capitalGains: number;
  otherIncome: number;
  /** Old-regime deductions; ignored entirely under the new regime. */
  section80C: number;
  section80D: number;
  section80CCD1B: number;
  interestDeduction: number;
  taxPaid: number;
}

export interface RegimeResult {
  grossIncome: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  balance: number;
}

export interface IncomeTaxResult {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
  difference: number;
}

function applySlabs(taxableIncome: number, slabs: Slab[]): number {
  let tax = 0;
  let lower = 0;

  for (const slab of slabs) {
    const upper = slab.upTo ?? Infinity;
    if (taxableIncome > lower) {
      const portion = Math.min(taxableIncome, upper) - lower;
      tax += portion * slab.rate;
    }
    lower = upper;
    if (taxableIncome <= upper) break;
  }

  return tax;
}

function applySurcharge(tax: number, totalIncome: number, bands: SurchargeBand[]): number {
  let rate = 0;
  for (const band of bands) {
    if (totalIncome > band.above) rate = band.rate;
  }
  return tax * rate;
}

const round = (n: number) => Math.round(n);
const clamp = (n: number, max: number) => Math.max(0, Math.min(n, max));

function computeRegime(input: IncomeTaxInput, regime: "old" | "new"): RegimeResult {
  const grossIncome =
    Math.max(0, input.salaryIncome) +
    input.housePropertyIncome +
    Math.max(0, input.businessIncome) +
    Math.max(0, input.capitalGains) +
    Math.max(0, input.otherIncome);

  // Standard deduction is available against salary income only.
  const standardDeduction =
    input.salaryIncome > 0
      ? Math.min(STANDARD_DEDUCTION[regime], input.salaryIncome)
      : 0;

  // Chapter VI-A deductions are not available under the new regime.
  const chapterVIA =
    regime === "old"
      ? clamp(input.section80C, DEDUCTION_LIMITS.section80C) +
        clamp(input.section80D, DEDUCTION_LIMITS.section80D) +
        clamp(input.section80CCD1B, DEDUCTION_LIMITS.section80CCD1B) +
        Math.max(0, input.interestDeduction)
      : 0;

  const totalDeductions = standardDeduction + chapterVIA;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[input.ageCategory];
  const taxBeforeRebate = applySlabs(taxableIncome, slabs);

  const rebateRule = REBATE_87A[regime];
  const rebate =
    taxableIncome <= rebateRule.incomeLimit
      ? Math.min(taxBeforeRebate, rebateRule.maxRebate)
      : 0;

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate);
  const surcharge = applySurcharge(taxAfterRebate, taxableIncome, SURCHARGE_BANDS[regime]);
  const cess = (taxAfterRebate + surcharge) * CESS_RATE;
  const totalTax = taxAfterRebate + surcharge + cess;

  return {
    grossIncome: round(grossIncome),
    standardDeduction: round(standardDeduction),
    totalDeductions: round(totalDeductions),
    taxableIncome: round(taxableIncome),
    taxBeforeRebate: round(taxBeforeRebate),
    rebate: round(rebate),
    surcharge: round(surcharge),
    cess: round(cess),
    totalTax: round(totalTax),
    balance: round(totalTax - Math.max(0, input.taxPaid)),
  };
}

/**
 * Returns both regimes side by side. It deliberately does not identify a
 * recommended regime — that determination depends on facts the calculator does
 * not capture and is a matter for professional advice.
 */
export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const oldRegime = computeRegime(input, "old");
  const newRegime = computeRegime(input, "new");

  return {
    oldRegime,
    newRegime,
    difference: Math.abs(oldRegime.totalTax - newRegime.totalTax),
  };
}
