import { calculateEmi } from "./emi";

export interface AmortisationYear {
  /** 1-based loan year. */
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  /** Outstanding principal at the end of this year. */
  balance: number;
  /** Share of the original principal repaid so far, 0-100. */
  percentRepaid: number;
}

/**
 * Year-by-year repayment split for a reducing-balance loan.
 *
 * `calculateEmi` only returns totals; the year table is what home-loan pages
 * actually show (and what competitors rank with), so it lives here rather
 * than being recomputed per component. Interest is accrued monthly on the
 * running balance, then aggregated into loan years, so the split matches how
 * a lender's own schedule reads.
 *
 * The final year absorbs any sub-rupee drift from monthly rounding, which is
 * why `balance` is floored at 0 rather than allowed to go slightly negative.
 */
export function buildAmortisationSchedule(
  principal: number,
  annualRatePercent: number,
  tenureYears: number,
): AmortisationYear[] {
  const startingPrincipal = Math.max(0, principal);
  if (startingPrincipal === 0) return [];

  const years = Math.max(1, Math.round(tenureYears));
  const months = years * 12;
  const monthlyRate = Math.max(0, annualRatePercent) / 12 / 100;
  const { monthlyEmi } = calculateEmi({ principal: startingPrincipal, annualRatePercent, tenureYears });

  const schedule: AmortisationYear[] = [];
  let balance = startingPrincipal;

  for (let year = 1; year <= years; year++) {
    let principalPaid = 0;
    let interestPaid = 0;

    for (let m = 0; m < 12; m++) {
      const monthIndex = (year - 1) * 12 + m;
      if (monthIndex >= months) break;

      const interest = balance * monthlyRate;
      // Last instalment clears whatever is left rather than the nominal EMI.
      const principalComponent =
        monthIndex === months - 1 ? balance : Math.min(monthlyEmi - interest, balance);

      interestPaid += interest;
      principalPaid += principalComponent;
      balance = Math.max(0, balance - principalComponent);
    }

    const round2 = (n: number) => Math.round(n * 100) / 100;
    schedule.push({
      year,
      principalPaid: round2(principalPaid),
      interestPaid: round2(interestPaid),
      totalPaid: round2(principalPaid + interestPaid),
      balance: round2(balance),
      percentRepaid: round2(((startingPrincipal - balance) / startingPrincipal) * 100),
    });
  }

  return schedule;
}
