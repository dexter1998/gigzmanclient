/**
 * Maps a demo tenant's slug to which of the 4 High Properties landing-page
 * directions (~/Downloads/high-properties-4-template-hd/) it implements, and
 * to the URL segment that template is addressed by:
 * `/realestate/{urlSlug}/{clientSlug}/...`.
 *
 * Deliberately slug-keyed rather than a `clients.templateKey` DB column —
 * these are fixed, known demo tenants for the template library, not
 * something a real client ever needs to change from the dashboard, so a
 * migration for it would be pure overhead. If a real client ever needs a
 * configurable template, promote this to a column then.
 */
export type TemplateKey =
  | "premium-inventory"
  | "luxury-advisory"
  | "market-intelligence"
  | "locality-pseo";

export interface TemplateConfig {
  key: TemplateKey;
  label: string;
  /** URL segment: `/realestate/{urlSlug}/{clientSlug}`. */
  urlSlug: string;
  /** Directory name under the reference HD pack, for traceability in comments. */
  sourceDir: string;
}

export const TEMPLATE_REGISTRY: Record<TemplateKey, TemplateConfig> = {
  "premium-inventory": {
    key: "premium-inventory",
    label: "Premium Inventory / Showcase",
    urlSlug: "temp-luxury-showcase",
    sourceDir: "01-premium-inventory-showcase",
  },
  "luxury-advisory": {
    key: "luxury-advisory",
    label: "Luxury Advisory",
    urlSlug: "temp-advisory",
    sourceDir: "02-luxury-advisory",
  },
  "market-intelligence": {
    key: "market-intelligence",
    label: "Market Intelligence",
    urlSlug: "temp-market-intel",
    sourceDir: "03-market-intelligence",
  },
  "locality-pseo": {
    key: "locality-pseo",
    label: "Locality / pSEO",
    urlSlug: "temp-locality",
    sourceDir: "04-locality-pseo",
  },
};

const URL_SLUG_TO_KEY: Record<string, TemplateKey> = Object.fromEntries(
  Object.values(TEMPLATE_REGISTRY).map((t) => [t.urlSlug, t.key]),
) as Record<string, TemplateKey>;

const CLIENT_SLUG_TEMPLATE_MAP: Record<string, TemplateKey> = {
  "high-properties": "premium-inventory",
  "high-properties-advisory": "luxury-advisory",
  "high-properties-intelligence": "market-intelligence",
  "high-properties-locality": "locality-pseo",
};

export function getTemplateKeyForSlug(clientSlug: string | undefined | null): TemplateKey | undefined {
  if (!clientSlug) return undefined;
  return CLIENT_SLUG_TEMPLATE_MAP[clientSlug];
}

export function getTemplateConfig(key: TemplateKey): TemplateConfig {
  return TEMPLATE_REGISTRY[key];
}

/** `/realestate/{urlSlug}/{clientSlug}` path prefix for a known demo tenant, or `undefined`. */
export function getTemplateUrlSlugForClientSlug(clientSlug: string): string | undefined {
  const key = getTemplateKeyForSlug(clientSlug);
  return key ? TEMPLATE_REGISTRY[key].urlSlug : undefined;
}

/** True if `urlSlug` is a registered template URL segment (proxy.ts's cheap, DB-free check). */
export function isTemplateUrlSlug(urlSlug: string): boolean {
  return urlSlug in URL_SLUG_TO_KEY;
}

/** The template key a URL segment refers to — used by lib/tenant.ts's DB-verified check. */
export function getTemplateKeyForUrlSlug(urlSlug: string): TemplateKey | undefined {
  return URL_SLUG_TO_KEY[urlSlug];
}

/**
 * `/{vertical}/{clientSlug}` for most verticals, `/realestate/{templateUrlSlug}/
 * {clientSlug}` for a real-estate tenant — the one shared place that knows
 * this shape, so callers that build a tenant link outside of `getBasePath()`
 * (which already gets it right via the request headers) don't each
 * reimplement the branch.
 */
export function getTenantPath(vertical: string, clientSlug: string): string {
  if (vertical === "realestate") {
    const urlSlug = getTemplateUrlSlugForClientSlug(clientSlug);
    if (urlSlug) return `/${vertical}/${urlSlug}/${clientSlug}`;
  }
  return `/${vertical}/${clientSlug}`;
}
