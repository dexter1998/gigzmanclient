import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";

/**
 * Owns `generateStaticParams` for the `[tenant]` segment.
 *
 * This deliberately sits here rather than inside the `(public)` route group.
 * A route group is transparent in the URL, and Next did call the group
 * layout's generateStaticParams — but it then discarded the params returned
 * by *nested* dynamic segments below it, so the 500+ home-loan pages were
 * never prerendered. Declaring the tenant params on the real segment fixes
 * the chain.
 */
export async function generateStaticParams() {
  try {
    const rows = await db
      .select({ slug: clients.slug })
      .from(clients)
      .where(eq(clients.isActive, true));
    return rows.map((row) => ({ tenant: row.slug }));
  } catch {
    // No database reachable at build time — fall back to on-demand rendering
    // rather than failing the build.
    return [];
  }
}

export default function TenantSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
