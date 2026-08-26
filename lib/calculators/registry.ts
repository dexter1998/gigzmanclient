import { RATES_VERSION, TAX_YEAR, REVIEWED } from "./rates/fy-2026-27";

export { RATES_VERSION, TAX_YEAR, REVIEWED };

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
