import { TDS_SECTIONS, RATES_VERSION, type TdsSection } from "./rates/fy-2026-27";

export const TDS_VERSION = RATES_VERSION;
export { TDS_SECTIONS };

export interface TdsInput {
  sectionCode: string;
  paymentAmount: number;
  /** Payments already made to the same payee during the year, for threshold testing. */
  previousPayments: number;
  panAvailable: boolean;
  payeeIsIndividualOrHuf: boolean;
}

export interface TdsResult {
  section: TdsSection | null;
  threshold: number;
  aggregatePayments: number;
  thresholdCrossed: boolean;
  appliedRate: number;
  rateBasis: string;
  tdsAmount: number;
  netPayable: number;
  notes: string[];
}

export function findSection(code: string): TdsSection | null {
  return TDS_SECTIONS.find((s) => s.code === code) ?? null;
}

export function calculateTds(input: TdsInput): TdsResult {
  const section = findSection(input.sectionCode);
  const payment = Math.max(0, input.paymentAmount);
  const previous = Math.max(0, input.previousPayments);
  const aggregate = payment + previous;

  if (!section) {
    return {
      section: null,
      threshold: 0,
      aggregatePayments: aggregate,
      thresholdCrossed: false,
      appliedRate: 0,
      rateBasis: "No section selected",
      tdsAmount: 0,
      netPayable: payment,
      notes: [],
    };
  }

  const notes: string[] = [];
  if (section.note) notes.push(section.note);

  // Thresholds apply to aggregate payments during the year, not to each payment,
  // so deduction can begin partway through the year once the total crosses it.
  const thresholdCrossed = aggregate > section.threshold;

  let appliedRate: number;
  let rateBasis: string;

  if (!input.panAvailable) {
    appliedRate = section.noPanRate;
    rateBasis = "Higher rate applied because PAN is not available";
    notes.push(
      "Where the deductee's PAN is not furnished, deduction is required at the higher rate specified under the applicable provisions.",
    );
  } else if (!thresholdCrossed) {
    appliedRate = 0;
    rateBasis = "Aggregate payments are within the threshold";
    notes.push(
      `Deduction is generally not required until aggregate payments exceed ${formatInr(section.threshold)} during the year.`,
    );
  } else {
    appliedRate = section.residentRate;
    rateBasis = "Standard rate for a resident payee";

    // 194C carries a reduced rate for individual and HUF payees.
    if (section.code === "194C" && input.payeeIsIndividualOrHuf) {
      appliedRate = 0.01;
      rateBasis = "Reduced rate for an individual or Hindu undivided family payee";
    }
  }

  const tdsAmount = Math.round(payment * appliedRate);

  return {
    section,
    threshold: section.threshold,
    aggregatePayments: aggregate,
    thresholdCrossed,
    appliedRate,
    rateBasis,
    tdsAmount,
    netPayable: payment - tdsAmount,
    notes,
  };
}

function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
