/**
 * The farmhouse buy-side page family — the ~2,900-page half of the pSEO plan.
 *
 * One route (`/farmhouse/{slug}`) serves eight shapes, because they share a
 * layout and differ only in which slice of the market the page reports on:
 *
 *   in-sohna                      village overview
 *   for-sale-in-sohna             village, purchase intent
 *   farm-land-in-sohna            village, bare-land intent
 *   for-rent-in-sohna             village, letting intent
 *   1-acre-in-sohna               plot size × village
 *   1-acre-farm-land-in-sohna     plot size × village, bare land
 *   under-5-crore-in-sohna        budget × village
 *   3-bhk-in-sohna                configuration × village
 *   north-facing-in-sohna         orientation × village
 *   with-swimming-pool-in-sohna   feature × village
 *   1-acre / under-5-crore / …    the same facets across the whole belt
 *   near-south-delhi              by origin and drive time
 *   sohna-vs-bhondsi              two pockets compared
 *
 * Every one of them is written from `farm-market.data.ts`, which is
 * aggregated from the belt's own 442 listings — so a page states this
 * village's real listing count, median asking price, median plot size and
 * price per sq ft, and how many of those listings actually match the facet in
 * the URL, including when the answer is none. That is what keeps the matrix
 * from being the same sentence 2,900 times.
 *
 * `indexable()` is the quality gate. A combination with no matching listing
 * in a village that itself has almost none renders and is linked, but is
 * served `noindex, follow` and left out of the sitemap. Volume that cannot
 * say anything is a liability, not a win.
 */
import { inventoryNoun } from "@/lib/premium-v2/imagery";
import {
  ACRE_SQFT,
  BELT_STATS,
  ESTATES,
  VILLAGES,
  type MarketStats,
  type VillageRow,
} from "@/lib/premium-v2/farm-market.data";
import {
  ADJACENT,
  LANDMARKS,
  PINCODES,
  ROADS,
  aggregate,
  pocketsNear,
  type LandmarkGeo,
} from "@/lib/premium-v2/farm-geo";

export { ACRE_SQFT, BELT_STATS, ESTATES, VILLAGES };
export { ADJACENT, LANDMARKS, PINCODES, ROADS, aggregate, pocketsNear };
export type { LandmarkGeo };
export type { MarketStats, VillageRow };

/** Only tenants whose inventory is farmhouses publish this family. */
export function farmSearchEnabled(clientSlug: string | undefined | null): boolean {
  return inventoryNoun(clientSlug) === "farmhouse";
}

// ── Axes ─────────────────────────────────────────────────────────────

export interface SizeBand {
  slug: string;
  label: string;
  /** Inclusive square-foot window a listing must fall in to match. */
  min: number;
  max: number;
}

/**
 * Both units, because both get searched: the belt talks in acres and the
 * listings are written in square yards ("2,420 sq yd" is one acre).
 */
export const SIZES: SizeBand[] = [
  { slug: "500-sq-yd", label: "500 sq yd", min: 3600, max: 5850 },
  { slug: "1000-sq-yd", label: "1000 sq yd", min: 7200, max: 11700 },
  { slug: "2000-sq-yd", label: "2000 sq yd", min: 14400, max: 21600 },
  { slug: "half-acre", label: "Half acre", min: 17424, max: 26136 },
  { slug: "4000-sq-yd", label: "4000 sq yd", min: 28800, max: 41400 },
  { slug: "1-acre", label: "1 acre", min: 34848, max: 52272 },
  { slug: "1-5-acre", label: "1.5 acre", min: 52272, max: 78408 },
  { slug: "2-acre", label: "2 acre", min: 69696, max: 104544 },
  { slug: "3-acre", label: "3 acre", min: 104544, max: 156816 },
  { slug: "5-acre", label: "5 acre", min: 174240, max: 261360 },
];

export interface BudgetBand {
  slug: string;
  label: string;
  /** Rupees. `max` is the ceiling the slug names; `min` only for the top band. */
  min: number;
  max: number;
}

export const BUDGETS: BudgetBand[] = [
  { slug: "under-1-crore", label: "Under ₹1 Cr", min: 0, max: 10000000 },
  { slug: "under-2-crore", label: "Under ₹2 Cr", min: 0, max: 20000000 },
  { slug: "under-3-crore", label: "Under ₹3 Cr", min: 0, max: 30000000 },
  { slug: "under-5-crore", label: "Under ₹5 Cr", min: 0, max: 50000000 },
  { slug: "under-7-crore", label: "Under ₹7 Cr", min: 0, max: 70000000 },
  { slug: "under-10-crore", label: "Under ₹10 Cr", min: 0, max: 100000000 },
  { slug: "under-15-crore", label: "Under ₹15 Cr", min: 0, max: 150000000 },
  { slug: "above-15-crore", label: "Above ₹15 Cr", min: 150000000, max: Number.MAX_SAFE_INTEGER },
];

export const BHKS = [1, 2, 3, 4, 5, 6] as const;

export interface FacingOption {
  slug: string;
  label: string;
  /** Values as they appear in the listing data's `facing` column. */
  matches: string[];
}

export const FACINGS: FacingOption[] = [
  { slug: "north", label: "North", matches: ["North"] },
  { slug: "north-east", label: "North-East", matches: ["North - East", "North-East", "North East"] },
  { slug: "east", label: "East", matches: ["East"] },
  { slug: "south-east", label: "South-East", matches: ["South - East", "South-East", "South East"] },
  { slug: "south", label: "South", matches: ["South"] },
  { slug: "south-west", label: "South-West", matches: ["South - West", "South-West", "South West"] },
  { slug: "west", label: "West", matches: ["West"] },
  { slug: "north-west", label: "North-West", matches: ["North - West", "North-West", "North West"] },
];

export interface FeatureOption {
  slug: string;
  /** Reads after "Farmhouses …" — "with a swimming pool in Sohna". */
  label: string;
  /** Which counter on MarketStats reports it. */
  stat: keyof Pick<MarketStats, "pool" | "gated" | "park" | "corner" | "vaastu" | "readyToMove">;
  /** Why a buyer filters on it, in one line. */
  note: string;
}

export const FEATURES: FeatureOption[] = [
  {
    slug: "with-swimming-pool",
    label: "with a swimming pool",
    stat: "pool",
    note: "The most-requested feature in the belt, and the one most often left out of the day rate when the property is let.",
  },
  {
    slug: "in-gated-estate",
    label: "in a gated estate",
    stat: "gated",
    note: "A maintained internal road and a manned gate — which, on land you visit at weekends, matters more than anything inside the boundary wall.",
  },
  {
    slug: "park-facing",
    label: "park facing",
    stat: "park",
    note: "Open ground on one side that nobody can build on, which is the only reliable way to keep a view in a belt that is still filling in.",
  },
  {
    slug: "corner-plot",
    label: "on a corner plot",
    stat: "corner",
    note: "Two open sides, better light and a second access point — and a premium over an equivalent mid-block plot.",
  },
  {
    slug: "vaastu-compliant",
    label: "that are Vaastu compliant",
    stat: "vaastu",
    note: "Stated on the listing rather than verified by us; on land the orientation of the plot matters more than the rooms.",
  },
  {
    slug: "ready-to-move",
    label: "ready to move into",
    stat: "readyToMove",
    note: "Built and habitable now, as against a plot you will construct on — a two-year difference in when you can use it.",
  },
  {
    slug: "freehold",
    label: "on freehold title",
    stat: "gated",
    note: "Full ownership rather than a power of attorney or a lease. On farm land this is the single most important line in the paperwork.",
  },
  {
    slug: "with-farmhouse-built",
    label: "with a house already built",
    stat: "readyToMove",
    note: "A plot with a usable structure on it, so the purchase is a home rather than a project.",
  },
];

export interface Intent {
  slug: string;
  /** Reads as the h1 subject: "Farmhouses for sale in Sohna". */
  noun: string;
  blurb: string;
}

/** The four ways a village page gets searched. */
export const INTENTS: Intent[] = [
  {
    slug: "",
    noun: "Farmhouses",
    blurb:
      "Everything on the belt in this pocket — built farmhouses, semi-developed plots and bare farm land — with what the current listings actually ask.",
  },
  {
    slug: "for-sale",
    noun: "Farmhouses for sale",
    blurb:
      "Purchase inventory in this pocket, priced against what the rest of the belt is asking rather than against a portal average.",
  },
  {
    slug: "farm-land",
    noun: "Farm land",
    blurb:
      "Bare agricultural land and semi-developed plots — cheaper per square foot than a built property, and a longer list of things to check before you pay a token.",
  },
  {
    slug: "for-rent",
    noun: "Farmhouses for rent",
    blurb:
      "Properties in this pocket that let — by the day for an event, or on a longer arrangement to a family or a company.",
  },
];

/**
 * A place a page can be built on.
 *
 * Three kinds, and the difference matters to what a page may honestly claim.
 * A `village` has its own listings. A `road` has none of its own — it runs
 * through pockets that do, and reports theirs. An `adjacent` village is one
 * that trades in this market but had no row on the day of the scrape; its page
 * says so and reports its neighbours. Every one of them carries `sources`, so
 * the page can name which pockets the figures came from rather than presenting
 * an aggregate as if it were measured in one place.
 */
export type GeoKind = "village" | "road" | "adjacent";

export interface Geo {
  kind: GeoKind;
  slug: string;
  name: string;
  stats: MarketStats;
  /** Pockets the figures are aggregated from. Empty for a village — it is one. */
  sources: VillageRow[];
  /** Present for roads and adjacent villages. */
  note?: string;
}

function villageGeo(village: VillageRow): Geo {
  return { kind: "village", slug: village.slug, name: village.name, stats: village, sources: [] };
}

/** Every geo the facet matrix is built on: the 54 pockets plus the 20 roads. */
export function allGeos(): Geo[] {
  return [
    ...VILLAGES.map(villageGeo),
    ...ROADS.map((road) => {
      const { sources, ...stats } = aggregate(road.pockets);
      return { kind: "road" as const, slug: road.slug, name: road.name, stats, sources, note: road.note };
    }),
  ];
}

/**
 * The named estates behind a geo.
 *
 * `estates` sits on VillageRow rather than MarketStats, because only a village
 * has its own. A road or an adjacent village reports the estates of the
 * pockets it draws from.
 */
export function estatesOf(geo: Geo): [string, number][] {
  const rows = geo.kind === "village" ? [geo.stats as VillageRow] : geo.sources;
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const [name, n] of row.estates) {
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + n);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Adjacent villages get an overview page but not the full facet matrix. */
export function adjacentGeos(): Geo[] {
  return ADJACENT.map((adj) => {
    const { sources, ...stats } = aggregate(adj.pockets);
    return { kind: "adjacent" as const, slug: adj.slug, name: adj.name, stats, sources, note: adj.note };
  });
}

const GEO_BY_SLUG = new Map<string, Geo>();
for (const geo of [...allGeos(), ...adjacentGeos()]) GEO_BY_SLUG.set(geo.slug, geo);

export const geoBySlug = (slug: string) => GEO_BY_SLUG.get(slug);

/**
 * Roads carry a reduced matrix — intents, plot size and budget only.
 *
 * A road already aggregates several pockets, so a road × aspect page is an
 * average of averages, which is one abstraction too many to say anything with.
 */
export function facetableFor(geo: Geo): { sizes: boolean; budgets: boolean; bhk: boolean; facings: boolean; features: boolean } {
  const full = geo.kind === "village";
  return { sizes: geo.kind !== "adjacent", budgets: geo.kind !== "adjacent", bhk: full, facings: full, features: full };
}

/** Villages worth comparing head to head — the ones with enough data to say anything. */
export function comparablePairs(limit = 12): [VillageRow, VillageRow][] {
  const top = VILLAGES.slice(0, limit);
  const pairs: [VillageRow, VillageRow][] = [];
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) pairs.push([top[i], top[j]]);
  }
  return pairs;
}

// ── Lookups ──────────────────────────────────────────────────────────

const SIZE_BY_SLUG = new Map(SIZES.map((s) => [s.slug, s]));
const BUDGET_BY_SLUG = new Map(BUDGETS.map((b) => [b.slug, b]));
const FACING_BY_SLUG = new Map(FACINGS.map((f) => [f.slug, f]));
const FEATURE_BY_SLUG = new Map(FEATURES.map((f) => [f.slug, f]));
const LANDMARK_BY_SLUG = new Map(LANDMARKS.map((l) => [l.slug, l]));
const VILLAGE_BY_SLUG = new Map(VILLAGES.map((v) => [v.slug, v]));

export const villageBySlug = (slug: string) => VILLAGE_BY_SLUG.get(slug);
export const estateBySlug = (slug: string) => ESTATES.find((e) => e.slug === slug);

// ── Slug grammar ─────────────────────────────────────────────────────

export type FarmPage =
  | { kind: "geo"; geo: Geo; intent: Intent }
  | { kind: "size"; size: SizeBand; geo?: Geo; land: boolean }
  | { kind: "budget"; budget: BudgetBand; geo?: Geo; land: boolean }
  | { kind: "bhk"; bhk: number; geo?: Geo }
  | { kind: "facing"; facing: FacingOption; geo?: Geo }
  | { kind: "feature"; feature: FeatureOption; geo?: Geo }
  | { kind: "luxury"; geo?: Geo }
  | { kind: "owner"; geo?: Geo }
  | { kind: "landmark"; landmark: LandmarkGeo }
  | { kind: "compare"; a: VillageRow; b: VillageRow };

/**
 * Splits a trailing `-in-{geo}` off a slug.
 *
 * Matched against the known geo list rather than split on the separator,
 * because both halves contain hyphens — "1-acre-in-sohna-mandkola-road" has
 * four of them and only one is the join.
 */
function splitGeo(slug: string): { head: string; geo?: Geo } {
  const marker = "-in-";
  let at = slug.lastIndexOf(marker);
  while (at > 0) {
    const geo = geoBySlug(slug.slice(at + marker.length));
    if (geo) return { head: slug.slice(0, at), geo };
    at = slug.lastIndexOf(marker, at - 1);
  }
  if (slug.startsWith("in-")) {
    const geo = geoBySlug(slug.slice(3));
    if (geo) return { head: "", geo };
  }
  return { head: slug };
}

export function resolveFarmSlug(slug: string): FarmPage | null {
  if (slug.startsWith("near-")) {
    const landmark = LANDMARK_BY_SLUG.get(slug.slice(5));
    if (landmark) return { kind: "landmark", landmark };
  }

  const vs = slug.indexOf("-vs-");
  if (vs > 0) {
    const a = VILLAGE_BY_SLUG.get(slug.slice(0, vs));
    const b = VILLAGE_BY_SLUG.get(slug.slice(vs + 4));
    if (a && b && a.slug !== b.slug) return { kind: "compare", a, b };
  }

  const { head, geo } = splitGeo(slug);
  const allowed = geo ? facetableFor(geo) : { sizes: true, budgets: true, bhk: true, facings: true, features: true };

  if (geo) {
    const intent = INTENTS.find((i) => i.slug === head);
    if (intent) return { kind: "geo", geo, intent };
  }

  const bare = head || slug;

  if (bare === "luxury") return { kind: "luxury", geo };
  if (bare === "owner-direct") return { kind: "owner", geo };

  const landSuffix = "-farm-land";
  const land = bare.endsWith(landSuffix);
  const stem = land ? bare.slice(0, -landSuffix.length) : bare;

  const size = SIZE_BY_SLUG.get(stem);
  if (size && allowed.sizes) return { kind: "size", size, geo, land };

  const budget = BUDGET_BY_SLUG.get(stem);
  if (budget && allowed.budgets) return { kind: "budget", budget, geo, land };

  const bhkMatch = /^(\d)-bhk$/.exec(bare);
  if (bhkMatch && allowed.bhk) {
    const bhk = Number(bhkMatch[1]);
    if ((BHKS as readonly number[]).includes(bhk)) return { kind: "bhk", bhk, geo };
  }

  if (bare.endsWith("-facing") && allowed.facings) {
    const facing = FACING_BY_SLUG.get(bare.slice(0, -"-facing".length));
    if (facing) return { kind: "facing", facing, geo };
  }

  const feature = FEATURE_BY_SLUG.get(bare);
  if (feature && allowed.features) return { kind: "feature", feature, geo };

  return null;
}

/** Every slug this family publishes. */
export function allFarmSlugs(): string[] {
  const out: string[] = [];

  for (const geo of [...allGeos(), ...adjacentGeos()]) {
    const allowed = facetableFor(geo);
    for (const intent of INTENTS) {
      out.push(intent.slug ? `${intent.slug}-in-${geo.slug}` : `in-${geo.slug}`);
    }
    if (allowed.sizes) {
      for (const size of SIZES) {
        out.push(`${size.slug}-in-${geo.slug}`);
        if (geo.kind === "village") out.push(`${size.slug}-farm-land-in-${geo.slug}`);
      }
    }
    if (allowed.budgets) {
      for (const budget of BUDGETS) {
        out.push(`${budget.slug}-in-${geo.slug}`);
        if (geo.kind === "village") out.push(`${budget.slug}-farm-land-in-${geo.slug}`);
      }
    }
    if (allowed.bhk) for (const bhk of BHKS) out.push(`${bhk}-bhk-in-${geo.slug}`);
    if (allowed.facings) for (const facing of FACINGS) out.push(`${facing.slug}-facing-in-${geo.slug}`);
    if (allowed.features) for (const feature of FEATURES) out.push(`${feature.slug}-in-${geo.slug}`);
    if (geo.kind !== "adjacent") {
      out.push(`luxury-in-${geo.slug}`);
      out.push(`owner-direct-in-${geo.slug}`);
    }
  }

  // The same facets across the whole belt.
  for (const size of SIZES) {
    out.push(size.slug);
    out.push(`${size.slug}-farm-land`);
  }
  for (const budget of BUDGETS) out.push(budget.slug);
  for (const bhk of BHKS) out.push(`${bhk}-bhk`);
  for (const facing of FACINGS) out.push(`${facing.slug}-facing`);
  for (const feature of FEATURES) out.push(feature.slug);
  out.push("luxury", "owner-direct");

  for (const landmark of LANDMARKS) out.push(`near-${landmark.slug}`);
  for (const [a, b] of comparablePairs()) out.push(`${a.slug}-vs-${b.slug}`);

  return out;
}

// ── What the data says about a page ──────────────────────────────────

export interface FacetCount {
  /** Listings in scope that match the facet. */
  matched: number;
  /** Listings in scope at all — the geo, or the whole belt. */
  scope: number;
  scopeName: string;
}

/** The figures a page reports: its geo's, or the belt's when it has none. */
export function statsFor(page: FarmPage): MarketStats {
  if (page.kind === "landmark") {
    return aggregate(pocketsNear(page.landmark.lat, page.landmark.lng, 5).map((p) => p.village.slug));
  }
  if (page.kind === "compare") return BELT_STATS;
  return "geo" in page && page.geo ? page.geo.stats : BELT_STATS;
}

/** How many listings in this geo (or the belt) match the page's facet. */
export function facetCount(page: FarmPage): FacetCount {
  const stats = statsFor(page);
  const scopeName =
    page.kind === "landmark"
      ? `near ${page.landmark.name}`
      : "geo" in page && page.geo
        ? page.geo.name
        : "the belt";
  const base = { scope: stats.listings, scopeName };

  switch (page.kind) {
    case "bhk":
      return { ...base, matched: stats.bedrooms.find(([v]) => v === String(page.bhk))?.[1] ?? 0 };
    case "facing":
      return {
        ...base,
        matched: stats.facings
          .filter(([v]) => page.facing.matches.some((m) => m.toLowerCase() === v.toLowerCase()))
          .reduce((sum, [, n]) => sum + n, 0),
      };
    case "feature":
      return { ...base, matched: stats[page.feature.stat] };
    // Size, budget, luxury and owner cannot be counted from the aggregates —
    // they need the rows themselves, which the page fetches from the database.
    default:
      return { ...base, matched: stats.listings };
  }
}

/**
 * The quality gate.
 *
 * A page is indexable when it can say something specific: the geo has enough
 * listings behind it to describe, or the facet itself has matches. Everything
 * else still renders and is still linked — it is served `noindex, follow` and
 * left out of the sitemap, so the long tail passes link equity without putting
 * hundreds of near-empty pages in front of a crawler.
 */
export function indexable(page: FarmPage): boolean {
  if (page.kind === "landmark" || page.kind === "compare") return true;
  const geo = "geo" in page ? page.geo : undefined;
  if (!geo) return true; // belt-wide facets always have the full dataset behind them
  // Roads and adjacent villages aggregate several pockets, so they always have
  // something to report — and they are the geos with no competing page of ours.
  if (geo.kind !== "village") return geo.stats.listings > 0;
  if (page.kind === "geo") return geo.stats.listings >= 1;
  const { matched } = facetCount(page);
  return matched > 0 || geo.stats.listings >= 5;
}

// ── Formatting ───────────────────────────────────────────────────────

// ── Formatting ───────────────────────────────────────────────────────

export function crore(value: number | null): string {
  if (!value) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  return `₹${(value / 100000).toFixed(0)} L`;
}

export function acres(sqft: number | null): string {
  if (!sqft) return "—";
  const value = sqft / ACRE_SQFT;
  if (value < 0.9) return `${Math.round(sqft / 9).toLocaleString("en-IN")} sq yd`;
  return `${value.toFixed(2).replace(/\.?0+$/, "")} acre`;
}

export function perSqft(value: number | null): string {
  return value ? `₹${value.toLocaleString("en-IN")}/sq ft` : "—";
}
