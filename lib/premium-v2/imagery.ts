import { PROPERTY_TYPE_LABELS } from "@/lib/format";

const IMG = "/verticals/realestate/templates/premium-v2/images";
const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

/**
 * Which photography a tenant's home page uses.
 *
 * The template was shot for a city agency — highrises, corridor skylines,
 * commercial retail — and those pictures actively mislead on a client that
 * sells farmland and weekend houses in the Sohna belt. A buyer landing on
 * Evergreen and seeing a Golf Course Road tower has been told the wrong thing
 * before reading a word.
 *
 * Keyed by slug rather than inferred, because "is this a farmhouse client" is
 * a fact about the client, not something the inventory can be trusted to say:
 * a farm client may still carry a few apartments.
 */
export interface TenantImagery {
  hero: string;
  /** Tiles for the locality strip, in order. Falls back to corridor shots. */
  strip?: string[];
  /** Picture beside the seller/valuation form. */
  valuation: string;
  /** Panel in the scroll lead popup. */
  popup: string;
  /** Panel beside the "book a consultation" CTA. */
  consultation: string;
  /** Cover of the market report download. */
  marketReport: string;
  /** Hero of the contact page. */
  contact: string;
  /** Hero of the localities index. */
  localities: string;
  /** Panel beside the shortlist / personalised-recommendation CTA. */
  shortlist: string;
  /** Panel beside the recent-deals strip. */
  recentDeals: string;
  /** Hero of the bank and home-loan pages. */
  bankLoan: string;
}

const FARMHOUSE_IMAGERY: TenantImagery = {
  hero: `${IMG}/hero-farmhouse-evergreen-pool.webp`,
  // The stock valuation picture is a city apartment being appraised; on a
  // client whose sellers own land it showed the wrong asset next to the form
  // asking about their asset.
  valuation: `${FARM}/12-gurgaon-farmhouse.webp`,
  // Every one of these replaces a photograph of a tower, a corridor skyline or
  // a glass office lobby. They are picked for what the slot is asking for, not
  // just for being farmhouses: the popup and the consultation panel are warm
  // and lit because they appear next to "talk to us"; the localities and market
  // covers are wide estate shots because they stand for an area rather than a
  // house; the loan hero is the plainest, most bankable building of the set.
  popup: `${FARM}/03-gurgaon-farmhouse.webp`,
  consultation: `${FARM}/20-gurgaon-farmhouse.webp`,
  marketReport: `${FARM}/25-gurgaon-farmhouse.webp`,
  contact: `${FARM}/02-gurgaon-farmhouse.webp`,
  localities: `${FARM}/21-gurgaon-farmhouse.webp`,
  shortlist: `${FARM}/16-gurgaon-farmhouse.webp`,
  recentDeals: `${FARM}/13-gurgaon-farmhouse.webp`,
  bankLoan: `${FARM}/24-gurgaon-farmhouse.webp`,
  strip: [
    `${FARM}/01-gurgaon-farmhouse.webp`,
    `${FARM}/05-gurgaon-farmhouse.webp`,
    `${FARM}/09-gurgaon-farmhouse.webp`,
    `${FARM}/14-gurgaon-farmhouse.webp`,
    `${FARM}/20-gurgaon-farmhouse.webp`,
    `${FARM}/26-gurgaon-farmhouse.webp`,
  ],
};

const DEFAULT_IMAGERY: TenantImagery = {
  hero: `${IMG}/hero-curated-inventory-v2.png`,
  valuation: `${IMG}/property-valuation.png`,
  popup: `${IMG}/hero-curated-inventory-v2.png`,
  consultation: `${IMG}/hero-luxury-advisory.png`,
  marketReport: `${IMG}/market-report-cover.png`,
  contact: `${IMG}/hero-curated-inventory-v2.png`,
  localities: `${IMG}/hero-locality-discovery.png`,
  shortlist: `${IMG}/personalised-recommendation.png`,
  recentDeals: `${IMG}/property-valuation.png`,
  bankLoan: `${IMG}/hero-curated-inventory-v2.png`,
};

const BY_SLUG: Record<string, TenantImagery> = {
  "evergreen-real-estate": FARMHOUSE_IMAGERY,
};

export function imageryFor(clientSlug: string | undefined | null): TenantImagery {
  if (!clientSlug) return DEFAULT_IMAGERY;
  return BY_SLUG[clientSlug] ?? DEFAULT_IMAGERY;
}

/** Label for the inventory a tenant actually sells, for headings and copy. */
export function inventoryNoun(clientSlug: string | undefined | null): string {
  return clientSlug === "evergreen-real-estate" ? "farmhouse" : "property";
}

export { PROPERTY_TYPE_LABELS };
