import {
  STAMP_DUTY_RATES,
  REGISTRATION_FEE_RATE,
  REGISTRATION_FEE_CAP,
  RATES_VERSION,
} from "./rates/gurugram-2026";

export const STAMP_DUTY_VERSION = RATES_VERSION;
export { STAMP_DUTY_RATES };

export type OwnerCategory = "male" | "female" | "joint";

export interface StampDutyInput {
  propertyValue: number;
  ownerCategory: OwnerCategory;
}

export interface StampDutyResult {
  stampDuty: number;
  registrationFee: number;
  totalPayable: number;
  ratePercent: number;
}

/**
 * Stamp duty and registration fee only — does not include GST on
 * under-construction properties, brokerage, legal fees or other
 * transaction costs, and does not classify the transaction (e.g. gift,
 * partition) which can carry a different rate.
 */
export function calculateStampDuty(input: StampDutyInput): StampDutyResult {
  const value = Math.max(0, input.propertyValue);
  const rate = STAMP_DUTY_RATES[input.ownerCategory];

  const stampDuty = value * rate;
  const registrationFee = Math.min(value * REGISTRATION_FEE_RATE, REGISTRATION_FEE_CAP);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    stampDuty: round2(stampDuty),
    registrationFee: round2(registrationFee),
    totalPayable: round2(stampDuty + registrationFee),
    ratePercent: rate * 100,
  };
}
