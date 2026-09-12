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
}

const FARMHOUSE_IMAGERY: TenantImagery = {
  hero: `${IMG}/hero-farmhouse-evergreen.webp`,
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
