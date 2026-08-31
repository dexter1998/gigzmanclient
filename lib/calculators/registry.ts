import { RATES_VERSION, TAX_YEAR, REVIEWED } from "./rates/fy-2026-27";
import {
  RATES_VERSION as REALESTATE_RATES_VERSION,
  REVIEWED as REALESTATE_REVIEWED,
} from "./rates/gurugram-2026";

export { RATES_VERSION, TAX_YEAR, REVIEWED };
export { REALESTATE_RATES_VERSION, REALESTATE_REVIEWED };

export interface CalculatorDefinition {
  key: string;
  title: string;
  description: string;
  disclaimer: string;
  sourceNote: string;
  sortOrder: number;
}

/**
 * Seeded into the `calculators` table. The dashboard controls each calculator's
 * status, reviewer and disclaimer; the formulas and rate tables stay in code.
 */
export const CALCULATOR_DEFINITIONS: CalculatorDefinition[] = [
  {
    key: "income-tax",
    title: "Income and Salary Tax Calculator",
    description:
      "Estimates tax under the old and new regimes from income, deductions and tax already paid, and shows both side by side.",
    disclaimer:
      "This calculator produces an indicative estimate only. It does not identify a recommended regime and does not constitute professional advice. Applicability of exemptions, deductions and relief provisions depends on individual circumstances.",
    sourceNote: "Slab structure, standard deduction, rebate, surcharge and cess as configured in the rate table for the stated period.",
    sortOrder: 1,
  },
  {
    key: "tds",
    title: "TDS Calculator",
    description:
      "Indicates the applicable section, threshold treatment and deduction on a specified payment, including the position where PAN is unavailable.",
    disclaimer:
      "Section applicability depends on the nature of the payment and the status of the payee, and is determined on the facts of each case. This estimate does not constitute professional advice.",
    sourceNote: "Section rates and thresholds as configured in the rate table for the stated period.",
    sortOrder: 2,
  },
  {
    key: "gst",
    title: "GST Calculator",
    description:
      "Splits an inclusive or exclusive amount into base value and tax, separating CGST and SGST from IGST by supply type.",
    disclaimer:
      "The rate is selected by the user. This calculator does not classify goods or services, does not determine the applicable rate, and does not recommend an HSN or SAC code.",
    sourceNote: "Rate applied as selected by the user; no classification is performed.",
    sortOrder: 3,
  },
];

/**
 * Seeded for real-estate tenants only (see `scripts/seed-client.ts`) — the
 * real-estate analogue of `CALCULATOR_DEFINITIONS`. Same discipline: the
 * dashboard controls status/reviewer/disclaimer, formulas stay in code.
 */
export const REALESTATE_CALCULATOR_DEFINITIONS: CalculatorDefinition[] = [
  {
    key: "emi",
    title: "Home Loan EMI Calculator",
    description:
      "Estimates the monthly instalment on a home loan from the principal, interest rate and tenure using the standard reducing-balance method.",
    disclaimer:
      "This is an indicative estimate only. It does not account for processing fees, prepayment, insurance, or a floating rate resetting over the tenure, and does not constitute a loan offer or eligibility assessment.",
    sourceNote: "Standard reducing-balance EMI formula; the rate entered is provided by the user, not fetched from any lender.",
    sortOrder: 1,
  },
  {
    key: "stamp-duty",
    title: "Stamp Duty & Registration Calculator",
    description:
      "Estimates stamp duty and registration charges on a property purchase based on the declared value and the owner category.",
    disclaimer:
      "Rates shown are indicative and have not been confirmed against the state notification currently in force. Actual duty depends on the applicable circle rate, the transaction type and any concessions, and excludes GST, brokerage and legal fees.",
    sourceNote: "Rate table configured for Haryana / Gurugram (HRERA jurisdiction) as a representative structure; requires professional verification before this calculator is marked active.",
    sortOrder: 2,
  },
  {
    key: "rental-yield",
    title: "Rental Yield Calculator",
    description:
      "Estimates gross and net annual rental yield on a property from its value and expected monthly rent.",
    disclaimer:
      "Net yield assumes a flat expense ratio for maintenance, property tax and vacancy rather than actual costs. Actual returns depend on real operating expenses, tenancy gaps and market movement.",
    sourceNote: "Gross yield: (annual rent ÷ property value) × 100. Net yield deducts an assumed expense ratio from annual rent before the same calculation.",
    sortOrder: 3,
  },
];
