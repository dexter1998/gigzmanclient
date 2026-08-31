import { NET_YIELD_EXPENSE_RATIO, RATES_VERSION } from "./rates/gurugram-2026";

export const RENTAL_YIELD_VERSION = RATES_VERSION;

export interface RentalYieldInput {
  propertyValue: number;
  monthlyRent: number;
}

export interface RentalYieldResult {
  annualRent: number;
  grossYieldPercent: number;
  netYieldPercent: number;
  estimatedAnnualExpenses: number;
}

/**
 * Net yield assumes a flat expense ratio (maintenance, property tax,
 * vacancy) rather than actual costs — a placeholder assumption, not a
 * verified figure, same discipline as every other rate in this file.
 */
export function calculateRentalYield(input: RentalYieldInput): RentalYieldResult {
  const propertyValue = Math.max(0, input.propertyValue);
  const annualRent = Math.max(0, input.monthlyRent) * 12;

  const grossYieldPercent = propertyValue > 0 ? (annualRent / propertyValue) * 100 : 0;
  const estimatedAnnualExpenses = annualRent * NET_YIELD_EXPENSE_RATIO;
  const netYieldPercent =
    propertyValue > 0 ? ((annualRent - estimatedAnnualExpenses) / propertyValue) * 100 : 0;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    annualRent: round2(annualRent),
    grossYieldPercent: round2(grossYieldPercent),
    netYieldPercent: round2(netYieldPercent),
    estimatedAnnualExpenses: round2(estimatedAnnualExpenses),
  };
}
