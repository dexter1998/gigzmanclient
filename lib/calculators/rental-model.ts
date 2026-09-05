import { NET_YIELD_EXPENSE_RATIO } from "./rates/gurugram-2026";

/**
 * Whole-building rental model.
 *
 * The existing `calculateRentalYield` takes a single property value and a
 * single rent, which does not describe how Gurugram builder floors and
 * independent houses actually earn: an owner occupies one floor and rents the
 * rest, and each rented floor is a different configuration. This models the
 * building — total worth, how many floors, how many of those are actually let,
 * and the unit mix — and answers the question the pages are built around:
 * how long until the property pays for itself.
 *
 * Everything here is arithmetic on the inputs. No rate lookup, no service.
 */

export type UnitType = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "studio" | "shop";

export const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "4bhk", label: "4 BHK" },
  { value: "shop", label: "Shop / commercial" },
];

export interface RentableFloor {
  unitType: UnitType;
  /** Expected rent for this floor, per month, in rupees. */
  monthlyRent: number;
}

export interface BuildingRentalInput {
  /** Approximate market worth of the whole property. */
  propertyValue: number;
  totalFloors: number;
  /** The floors actually available to let (the rest being self-occupied). */
  rentableFloors: RentableFloor[];
  /** Months per year the average unit sits empty. */
  vacancyMonthsPerYear?: number;
  /**
   * Annual appreciation, as a percent. Optional, and treated separately from
   * rent throughout — in Gurugram it dominates the return, and conflating the
   * two would overstate what rent alone achieves.
   */
  annualAppreciationPercent?: number;
}

export interface BuildingRentalResult {
  grossAnnualRent: number;
  /** After vacancy and the standing expense ratio. */
  netAnnualRent: number;
  estimatedAnnualExpenses: number;
  vacancyLoss: number;
  grossYieldPercent: number;
  netYieldPercent: number;
  monthlyRentTotal: number;
  /** Years to recover the property value from net rent alone. */
  paybackYearsRentOnly: number | null;
  /** Years to recover once appreciation is counted alongside rent. */
  paybackYearsWithAppreciation: number | null;
  /** Years for appreciation alone to double the value (rule of 72). */
  doublingYears: number | null;
  occupiedFloors: number;
}

export function calculateBuildingRental(input: BuildingRentalInput): BuildingRentalResult {
  const propertyValue = Math.max(0, input.propertyValue);
  const floors = input.rentableFloors.filter((f) => f.monthlyRent > 0);

  const monthlyRentTotal = floors.reduce((sum, f) => sum + Math.max(0, f.monthlyRent), 0);
  const grossAnnualRent = monthlyRentTotal * 12;

  const vacancyMonths = Math.min(12, Math.max(0, input.vacancyMonthsPerYear ?? 0));
  const vacancyLoss = monthlyRentTotal * vacancyMonths;
  const rentAfterVacancy = Math.max(0, grossAnnualRent - vacancyLoss);

  // Maintenance, property tax and repairs, as a share of collected rent —
  // the same placeholder ratio the single-unit calculator uses, and it
  // carries the same "not verified costs" caveat on screen.
  const estimatedAnnualExpenses = rentAfterVacancy * NET_YIELD_EXPENSE_RATIO;
  const netAnnualRent = Math.max(0, rentAfterVacancy - estimatedAnnualExpenses);

  const grossYieldPercent = propertyValue > 0 ? (grossAnnualRent / propertyValue) * 100 : 0;
  const netYieldPercent = propertyValue > 0 ? (netAnnualRent / propertyValue) * 100 : 0;

  const appreciation = Math.max(0, input.annualAppreciationPercent ?? 0);
  const combinedPercent = netYieldPercent + appreciation;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    grossAnnualRent: round2(grossAnnualRent),
    netAnnualRent: round2(netAnnualRent),
    estimatedAnnualExpenses: round2(estimatedAnnualExpenses),
    vacancyLoss: round2(vacancyLoss),
    grossYieldPercent: round2(grossYieldPercent),
    netYieldPercent: round2(netYieldPercent),
    monthlyRentTotal: round2(monthlyRentTotal),
    paybackYearsRentOnly: netYieldPercent > 0 ? round2(100 / netYieldPercent) : null,
    paybackYearsWithAppreciation: combinedPercent > 0 ? round2(100 / combinedPercent) : null,
    doublingYears: appreciation > 0 ? round2(72 / appreciation) : null,
    occupiedFloors: floors.length,
  };
}

/**
 * A plain-language read of the result. Written per band rather than as one
 * templated sentence, so pages across the ladder do not all say the same
 * thing with a number swapped in.
 */
export function paybackVerdict(result: BuildingRentalResult): string {
  const rentOnly = result.paybackYearsRentOnly;
  const combined = result.paybackYearsWithAppreciation;

  if (!rentOnly) {
    return "Add the rent you expect for each let floor to see how long the property takes to pay for itself.";
  }

  const rentText = `On rent alone this takes about ${Math.round(rentOnly)} years to return what the property cost.`;

  if (!combined || combined >= rentOnly) {
    return `${rentText} That is the honest number for a Gurugram let — yields here are low, and rent is rarely the whole return.`;
  }

  return `${rentText} Counting capital appreciation as well, the figure drops to roughly ${Math.round(combined)} years — which is the number that actually reflects how Gurugram property has paid back, because appreciation, not rent, does most of the work.`;
}
