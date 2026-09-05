/**
 * Maps a real-estate tenant's slug to the template it renders and to the
 * URL segment that template is addressed by: `/realestate/{urlSlug}/
 * {clientSlug}/...`. Premium V2 is the only surviving template — the earlier
 * premium-inventory/luxury-advisory/market-intelligence/locality-pseo
 * template-library demos were removed.
 *
 * Deliberately slug-keyed rather than a `clients.templateKey` DB column —
 * this only needs to say "yes, this slug is a real-estate tenant using the
 * template", and a slug-keyed map does that for the one real client without
 * a migration. If a second real-estate client is ever onboarded, add its
 * slug here.
 */
export type TemplateKey = "premium-v2";

export interface TemplateConfig {
  key: TemplateKey;
  label: string;
  /** URL segment: `/realestate/{urlSlug}/{clientSlug}`. */
  urlSlug: string;
  /** Directory name under the reference HD pack, for traceability in comments. */
  sourceDir: string;
}

export const TEMPLATE_REGISTRY: Record<TemplateKey, TemplateConfig> = {
  "premium-v2": {
    key: "premium-v2",
    label: "Premium V2",
    urlSlug: "temp-premium-v2",
    sourceDir: "geeta-properties-premium-mixed-v2",
  },
};

const URL_SLUG_TO_KEY: Record<string, TemplateKey> = Object.fromEntries(
  Object.values(TEMPLATE_REGISTRY).map((t) => [t.urlSlug, t.key]),
) as Record<string, TemplateKey>;

const CLIENT_SLUG_TEMPLATE_MAP: Record<string, TemplateKey> = {
  "high-properties": "premium-v2",
  "evergreen-real-estate": "premium-v2",
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
