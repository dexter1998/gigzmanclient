import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";

/**
 * Helpers for `generateStaticParams` on nested dynamic routes.
 *
 * Important behaviour this works around: a child segment's
 * `generateStaticParams` must return the COMPLETE param set, including the
 * `tenant` param owned by the ancestor segment. Returning only the child's
 * own param (and relying on Next to compose it with the parent's) silently
 * produced nothing — the function was called once per tenant and its results
 * discarded, so several hundred pages fell back to on-demand rendering while
 * still being reported as prerendered in the build summary.
 *
 * Every list falls back to an empty array when the database is unreachable at
 * build time, so a build never fails over this — those routes simply render
 * on demand and are cached afterwards.
 */
export async function activeTenants(): Promise<{ id: string; slug: string }[]> {
  try {
    return await db
      .select({ id: clients.id, slug: clients.slug })
      .from(clients)
      .where(eq(clients.isActive, true));
  } catch {
    return [];
  }
}

/** Builds `{ tenant, ...child }` rows from a per-tenant lookup. */
export async function paramsForEachTenant<T extends Record<string, string>>(
  rowsFor: (tenant: { id: string; slug: string }) => Promise<T[]>,
): Promise<({ tenant: string } & T)[]> {
  const tenants = await activeTenants();
  const out: ({ tenant: string } & T)[] = [];
  for (const tenant of tenants) {
    try {
      for (const row of await rowsFor(tenant)) out.push({ tenant: tenant.slug, ...row });
    } catch {
      // One tenant failing to enumerate must not take the whole build down.
    }
  }
  return out;
}
