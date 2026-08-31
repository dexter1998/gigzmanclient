import { RATES_VERSION } from "./rates/gurugram-2026";

export const EMI_VERSION = RATES_VERSION;

export interface EmiInput {
  principal: number;
  annualRatePercent: number;
  tenureYears: number;
}

export interface EmiResult {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
}

/**
 * Standard reducing-balance EMI formula. Does not account for processing
 * fees, prepayment, rate resets on a floating loan, or eligibility — a bank's
 * sanctioned EMI can differ from this estimate.
 */
export function calculateEmi(input: EmiInput): EmiResult {
  const principal = Math.max(0, input.principal);
  const months = Math.max(1, Math.round(input.tenureYears * 12));
  const monthlyRate = Math.max(0, input.annualRatePercent) / 12 / 100;

  const monthlyEmi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);

  const totalPayment = monthlyEmi * months;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    monthlyEmi: round2(monthlyEmi),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalPayment - principal),
    principal: round2(principal),
  };
}
