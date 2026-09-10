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
/**
 * A single-client deployment (a client's own domain, `TENANT_MODE=host`) has
 * no reason to prerender every other tenant's pages. `TENANT_ONLY` is a
 * comma-separated slug list that narrows the build to those clients; unset, it
 * builds all of them, which is what the shared multi-tenant deployment wants.
 */
const TENANT_ONLY = (process.env.TENANT_ONLY ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function activeTenants(): Promise<{ id: string; slug: string }[]> {
  try {
    const rows = await db
      .select({ id: clients.id, slug: clients.slug })
      .from(clients)
      .where(eq(clients.isActive, true));
    return TENANT_ONLY.length > 0 ? rows.filter((r) => TENANT_ONLY.includes(r.slug)) : rows;
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
    } catch (error) {
      // One tenant failing to enumerate must not take the whole build down —
      // but it must not do so silently either. Swallowing this is how a route
      // ends up with zero params and is quietly demoted to fully dynamic
      // rendering, which looks like a performance problem and behaves like an
      // SEO one (a streamed dynamic render answers 200 before `notFound()`
      // can set a status).
      console.error(
        `generateStaticParams: enumerating "${tenant.slug}" failed, its pages will render on demand —`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  return out;
}

