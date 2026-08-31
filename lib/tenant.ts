import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { joinPath } from "@/lib/paths";

export { joinPath };

export type Tenant = typeof clients.$inferSelect;

/**
 * Resolved once per request. `cache` dedupes the lookup across every component
 * that needs the tenant, so a page with a header, footer and body costs one query.
 */
export const getTenant = cache(async (): Promise<Tenant | null> => {
  const h = await headers();

  const slug = h.get("x-tenant");
  if (slug) {
    const [row] = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
    if (!row) return null;

    // proxy.ts only confirms the URL's vertical segment is a *known* vertical —
    // it never touches the database. Here is where that segment is checked
    // against the client's actual vertical, so /cafirm/<realestate-client-slug>
    // 404s instead of rendering that client under the wrong template.
    const urlVertical = h.get("x-tenant-vertical");
    if (urlVertical && urlVertical !== row.vertical) return null;

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
