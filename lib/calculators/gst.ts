import { GST_RATES, RATES_VERSION } from "./rates/fy-2026-27";

export const GST_VERSION = RATES_VERSION;
export { GST_RATES };

export type AmountType = "exclusive" | "inclusive";
export type SupplyType = "intra_state" | "inter_state";

export interface GstInput {
  amount: number;
  amountType: AmountType;
  ratePercent: number;
  supplyType: SupplyType;
}

export interface GstResult {
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  totalAmount: number;
}

/**
 * The rate is supplied by the user. This calculator does not classify goods or
 * services, does not suggest an HSN or SAC code, and does not determine the rate
 * applicable to a supply — each of those depends on the facts.
 */
export function calculateGst(input: GstInput): GstResult {
  const amount = Math.max(0, input.amount);
  const rate = Math.max(0, input.ratePercent) / 100;

  // For an inclusive amount the tax is extracted from the total rather than added.
  const baseAmount = input.amountType === "inclusive" ? amount / (1 + rate) : amount;
  const totalGst = baseAmount * rate;

  const isIntraState = input.supplyType === "intra_state";
  const cgst = isIntraState ? totalGst / 2 : 0;
  const sgst = isIntraState ? totalGst / 2 : 0;
  const igst = isIntraState ? 0 : totalGst;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    baseAmount: round2(baseAmount),
    cgst: round2(cgst),
    sgst: round2(sgst),
    igst: round2(igst),
    totalGst: round2(totalGst),
    totalAmount: round2(baseAmount + totalGst),
  };
}
