import type { localities, properties } from "@/lib/db/schema";

type Locality = typeof localities.$inferSelect;
type Property = typeof properties.$inferSelect;

/**
 * Turns a loan amount into "what this actually buys in Gurugram".
 *
 * This is the reason these pages exist. The site's commercial goal is ranking
 * for property search in Gurugram, not for home loans — so every loan page
 * has to convert a financing query into property intent. A bank or a national
 * aggregator can publish the EMI maths; none of them can say which Gurugram
 * corridor a ₹50 lakh loan actually reaches, because none of them hold
 * corridor pricing or live local inventory. That gap is the whole wedge, and
 * it is also what stops 500 loan pages reading as one template with a number
 * swapped in — the property section genuinely differs rung by rung.
 *
 * All figures derive from the tenant's own seeded corridor data, so they
 * inherit whatever verification status that data carries.
 */

/** Lenders in this segment typically fund up to 80% of agreement value. */
export const STANDARD_LTV = 0.8;

export interface CorridorFit {
  locality: Locality;
  /** Built-up sqft the budget reaches at this corridor's average rate. */
  affordableSqft: number;
  /** True when the budget clears a usable 2BHK (~1,000 sqft) here. */
  isRealistic: boolean;
  /** True when the budget is comfortably above entry level for the corridor. */
  isComfortable: boolean;
}

export interface AffordabilitySnapshot {
  loanAmount: number;
  /** Agreement value the loan supports at standard LTV. */
  propertyBudget: number;
  downPayment: number;
  /** Corridors ordered cheapest-first, so the reachable ones read first. */
  corridors: CorridorFit[];
  /** Corridors the budget genuinely reaches. */
  reachable: CorridorFit[];
  /** Live listings at or under the supported budget. */
  matches: Property[];
  /** Listings just above budget — useful "stretch" context, never presented as affordable. */
  stretch: Property[];
}

/**
 * Corridor rates are quoted on super area, where a compact Gurugram 2BHK
 * lands around 800 sqft — the earlier 1,000 threshold pushed genuine
 * entry-level budgets (₹50L, which clears ~820 sqft on SPR) into the same
 * "out of reach" copy as ₹25L, which is not true and made two rungs read
 * identically.
 */
const USABLE_2BHK_SQFT = 800;
const COMFORTABLE_SQFT = 1_600;

export function buildAffordability(
  loanAmount: number,
  allLocalities: Locality[],
  allProperties: Property[],
): AffordabilitySnapshot {
  const propertyBudget = Math.round(loanAmount / STANDARD_LTV);
  const downPayment = propertyBudget - loanAmount;

  const corridors: CorridorFit[] = allLocalities
    .filter((l) => typeof l.avgPricePerSqft === "number" && (l.avgPricePerSqft ?? 0) > 0)
    .map((locality) => {
      const rate = locality.avgPricePerSqft as number;
      const affordableSqft = Math.round(propertyBudget / rate);
      return {
        locality,
        affordableSqft,
        isRealistic: affordableSqft >= USABLE_2BHK_SQFT,
        isComfortable: affordableSqft >= COMFORTABLE_SQFT,
      };
    })
    .sort((a, b) => (a.locality.avgPricePerSqft ?? 0) - (b.locality.avgPricePerSqft ?? 0));

  const priced = allProperties.filter((p) => typeof p.price === "number" && (p.price ?? 0) > 0);

  const matches = priced
    .filter((p) => (p.price as number) <= propertyBudget)
    .sort((a, b) => (b.price as number) - (a.price as number))
    .slice(0, 6);

  const stretch = priced
    .filter((p) => {
      const price = p.price as number;
      return price > propertyBudget && price <= propertyBudget * 1.25;
    })
    .sort((a, b) => (a.price as number) - (b.price as number))
    .slice(0, 3);

  return {
    loanAmount,
    propertyBudget,
    downPayment,
    corridors,
    reachable: corridors.filter((c) => c.isRealistic),
    matches,
    stretch,
  };
}

/**
 * One honest sentence describing what this budget means in Gurugram, varying
 * by band. Written per band rather than templated from a single string so the
 * copy reads differently across the ladder instead of swapping a number.
 */
export function affordabilityVerdict(snapshot: AffordabilitySnapshot): string {
  const { propertyBudget, reachable, corridors } = snapshot;
  const crore = propertyBudget / 10_000_000;
  const cheapest = corridors[0]?.locality.name;
  const names = reachable.map((c) => c.locality.name);

  if (reachable.length === 0) {
    const best = corridors[0];
    return best
      ? `A full apartment is out of reach at this budget across the corridors we track. ${cheapest} is the closest — it reaches about ${best.affordableSqft.toLocaleString("en-IN")} sq.ft, short of a usable 2BHK — so the realistic routes here are a plot, a smaller configuration, or an under-construction unit bought early in the cycle.`
      : `This budget sits below entry level for the corridors we track in Gurugram.`;
  }

  if (crore < 0.9) {
    const picks = names.slice(0, 2);
    return `This is entry-level Gurugram. ${picks.join(" and ")} ${picks.length === 1 ? "is" : "are"} where the budget works — expect a compact 2BHK, an older resale unit, or a builder floor rather than a branded high-rise.`;
  }

  if (crore < 1.8) {
    return `This is the mid-market band, and the widest choice on the map: ${names.slice(0, 3).join(", ")} all open up, typically as a 3BHK in a gated development or a well-located builder floor.`;
  }

  if (crore < 3.5) {
    const top = names.slice(-2);
    return `At this level the premium corridors come into range. ${top.join(" and ")} ${top.length === 1 ? "becomes" : "become"} realistic for a 3–4BHK in a branded project, with the newer Dwarka Expressway launches offering more space per rupee than Golf Course Road.`;
  }

  return `This is the luxury band. Every corridor we track is reachable, so the decision stops being about budget and becomes one about address, developer track record and possession timeline.`;
}
