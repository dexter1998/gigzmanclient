import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { joinPath } from "@/lib/paths";
import { getTemplateKeyForSlug, getTemplateKeyForUrlSlug, getTenantPath } from "@/lib/templates";

export { joinPath };

export type Tenant = typeof clients.$inferSelect;

/**
 * Resolved once per request. `cache` dedupes the lookup across every component
 * that needs the tenant, so a page with a header, footer and body costs one query.
 */
/**
 * Slug -> client row, cached across requests. This lookup runs on every
 * single request (layout, page, metadata) and is a cross-region query, so
 * leaving it uncached cost a round trip on every navigation.
 */
const lookupClientBySlug = unstable_cache(
  async (slug: string) => {
    const [row] = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
    return row ?? null;
  },
  ["client-by-slug"],
  { revalidate: 300 },
);

/**
 * Resolve a tenant from a URL segment instead of a request header.
 *
 * This is what makes the public site cacheable. `getTenant()` below reads
 * `headers()`, and any page that does so is forced into dynamic rendering —
 * Next then sends `no-store` and every single request re-renders on the
 * server. Taking the slug from `params` keeps the render free of dynamic
 * APIs, so public pages can be prerendered and revalidated instead.
 *
 * The header-based version is kept for the dashboard and for server actions,
 * which are per-user and dynamic by nature.
 */
export const getTenantBySlug = cache(async (slug: string): Promise<Tenant | null> => {
  const row = await lookupClientBySlug(slug);
  if (!row) return null;

  // Same DB-verified guard the header path applies: a real-estate client must
  // actually be assigned the template its URL claims, so a wrong template
  // segment 404s rather than rendering the client under foreign chrome.
  if (row.vertical === "realestate" && !getTemplateKeyForSlug(row.slug)) return null;

  return row;
});

/** Link prefix for a tenant, derived from the row rather than a header. */
export function basePathFor(tenant: Tenant): string {
  return getTenantPath(tenant.vertical, tenant.slug);
}

export const getTenant = cache(async (): Promise<Tenant | null> => {
  const h = await headers();

  const slug = h.get("x-tenant");
  if (slug) {
    const row = await lookupClientBySlug(slug);
    if (!row) return null;

    // proxy.ts only confirms the URL's vertical segment is a *known* vertical —
    // it never touches the database. Here is where that segment is checked
    // against the client's actual vertical, so /cafirm/<realestate-client-slug>
    // 404s instead of rendering that client under the wrong template.
    const urlVertical = h.get("x-tenant-vertical");
    if (urlVertical && urlVertical !== row.vertical) return null;

    // Realestate carries an extra `{template}` URL segment (proxy.ts); confirm
    // it's actually the template this client is assigned, the same
    // DB-verified pattern as the vertical check above — /realestate/
    // temp-locality/<a-luxury-advisory-client> should 404, not silently
    // render that client under the wrong template's chrome.
    const urlTemplateSlug = h.get("x-tenant-template-slug");
    if (urlTemplateSlug) {
      const urlTemplateKey = getTemplateKeyForUrlSlug(urlTemplateSlug);
      const clientTemplateKey = getTemplateKeyForSlug(row.slug);
      if (!urlTemplateKey || urlTemplateKey !== clientTemplateKey) return null;
    }

    return row;
  }

  const host = h.get("x-tenant-host");
  if (host) {
    const [row] = await db.select().from(clients).where(eq(clients.customDomain, host)).limit(1);
    return row ?? null;
  }

  return null;
});

/** Throws where a tenant is structurally required, so pages fail loudly rather than blank. */
export async function requireTenant(): Promise<Tenant> {
  const tenant = await getTenant();
  if (!tenant) throw new Error("No tenant resolved for this request");
  return tenant;
}

/**
 * Path prefix for links. Empty in host mode, `/cafirm/<slug>` in path mode,
 * so every internal href is written as a clean route and prefixed here.
 */
export const getBasePath = cache(async (): Promise<string> => {
  const h = await headers();
  return h.get("x-tenant-base") ?? "";
});

/** Convenience for server components: `await tenantPath("/services")`. */
export async function tenantPath(path: string): Promise<string> {
  return joinPath(await getBasePath(), path);
}
