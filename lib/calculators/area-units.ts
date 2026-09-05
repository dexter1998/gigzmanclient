/**
 * Land-area unit conversion, scoped to the units actually used in Haryana.
 *
 * Every factor is expressed in square feet, so conversion is a single
 * division — no external service, no lookup table of pairs.
 *
 * IMPORTANT: bigha, biswa, marla and kanal are NOT nationally standard. The
 * values below are the Haryana/Punjab ones, cross-checked against a published
 * Haryana converter (marla 272.25, kanal 5,445, bigha 10,890, biswa 544.5)
 * and internally consistent with each other: 20 marla = 1 kanal, 20 biswa =
 * 1 bigha, 8 kanal = 4 bigha = 1 acre. Do not reuse these for another state
 * without re-verifying — a Rajasthan or UP bigha is a different size, and
 * publishing the wrong one on a property page is a real error.
 */

export interface AreaUnit {
  slug: string;
  /** Display name, e.g. "Marla". */
  name: string;
  /** Plural/other spellings people search for. */
  aka?: string[];
  /** Square feet in one of this unit. */
  sqft: number;
  /** True where the size is state-specific rather than universal. */
  stateSpecific?: boolean;
  /** One line of genuine context for the unit's own page. */
  note: string;
}

const SQ_YARD = 9;
const MARLA = 272.25;

export const AREA_UNITS: AreaUnit[] = [
  {
    slug: "square-feet", name: "Square Feet", aka: ["sq ft", "sqft"], sqft: 1,
    note: "The default unit in Gurugram apartment listings — carpet, built-up and super area are all quoted in square feet.",
  },
  {
    slug: "square-yard", name: "Square Yard", aka: ["gaj", "gaz"], sqft: SQ_YARD,
    note: "Called gaj locally, and the unit almost every Gurugram plot and builder-floor listing is priced in.",
  },
  {
    slug: "square-metre", name: "Square Metre", aka: ["sq m", "square meter"], sqft: 10.76391,
    note: "Used on HSVP and municipal documents, and on RERA filings, even where the listing itself quotes square feet.",
  },
  {
    slug: "square-karam", name: "Square Karam", sqft: 30.25, stateSpecific: true,
    note: "A karam is 5.5 feet, so a square karam is 30.25 sq ft. Nine of them make one marla — the basis of the whole Haryana ladder.",
  },
  {
    slug: "marla", name: "Marla", sqft: MARLA, stateSpecific: true,
    note: "The standard plot unit across Haryana and Punjab. Plots are commonly sold as 5, 8, 10 or 14 marla.",
  },
  {
    slug: "biswa", name: "Biswa", sqft: 544.5, stateSpecific: true,
    note: "One twentieth of a Haryana bigha, and mostly seen in agricultural and revenue records rather than city listings.",
  },
  {
    slug: "kanal", name: "Kanal", sqft: 5445, stateSpecific: true,
    note: "Twenty marla. A one-kanal plot is the classic large Haryana residential plot.",
  },
  {
    slug: "bigha", name: "Bigha", sqft: 10890, stateSpecific: true,
    note: "In Haryana a bigha is a quarter of an acre. Other states use very different bigha sizes, so always confirm which one a listing means.",
  },
  {
    slug: "killa", name: "Killa", aka: ["acre"], sqft: 43560, stateSpecific: true,
    note: "A killa is one acre — the unit Haryana agricultural land is transacted in, and what licensed colony land is measured in.",
  },
  {
    slug: "acre", name: "Acre", sqft: 43560,
    note: "Standard across India for land parcels. Eight kanal, four Haryana bigha, or 4,840 square yards.",
  },
  {
    slug: "murabba", name: "Murabba", sqft: 25 * 43560, stateSpecific: true,
    note: "Twenty-five killa, i.e. 25 acres. A revenue-record unit for large consolidated agricultural holdings.",
  },
  {
    slug: "hectare", name: "Hectare", sqft: 107639.1042,
    note: "Used in master plans and land-acquisition notifications. One hectare is just under two and a half acres.",
  },
  {
    slug: "ground", name: "Ground", sqft: 2400,
    note: "A South Indian unit that turns up when buyers compare Gurugram plots against Chennai or Bengaluru ones.",
  },
  {
    slug: "cent", name: "Cent", sqft: 435.6,
    note: "One hundredth of an acre. Common in South India, and useful when converting a Gurugram plot size for comparison.",
  },
];

export function findUnit(slug: string): AreaUnit | undefined {
  return AREA_UNITS.find((u) => u.slug === slug);
}

export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  if (!Number.isFinite(value)) return 0;
  return (value * from.sqft) / to.sqft;
}

/** Trims trailing zeros without losing precision on very small ratios. */
export function formatArea(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : 6;
  return Number(value.toFixed(decimals)).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
  });
}

/** Every ordered pair, which is the page set for the converter. */
export function unitPairs(): { from: AreaUnit; to: AreaUnit }[] {
  const pairs: { from: AreaUnit; to: AreaUnit }[] = [];
  for (const from of AREA_UNITS) {
    for (const to of AREA_UNITS) {
      if (from.slug !== to.slug) pairs.push({ from, to });
    }
  }
  return pairs;
}

export function pairSlug(from: AreaUnit, to: AreaUnit): string {
  return `${from.slug}-to-${to.slug}`;
}

/** The quantities each converter page tabulates, mirroring how people search. */
export const COMMON_QUANTITIES = [1, 2, 3, 4, 5, 10, 20, 25, 50, 100, 500, 1000];
