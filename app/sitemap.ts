import type { MetadataRoute } from "next";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, services, professionalUpdates } from "@/lib/db/schema";
import { LOCATION_PAGES } from "@/lib/locations";
import { getVerticalConfig } from "@/lib/verticals";

export const dynamic = "force-dynamic";

/**
 * Emits one entry set per hosted client, using that client's vertical config
 * for the static route list. The dashboard, the deployment index, the template
 * library and the thank-you page are excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const activeClients = await db.select().from(clients).where(eq(clients.isActive, true));
  const entries: MetadataRoute.Sitemap = [];

  for (const client of activeClients) {
    const vertical = getVerticalConfig(client.vertical);
    const prefix = client.customDomain
      ? `https://${client.customDomain}`
      : `${base}/${client.vertical}/${client.slug}`;

    for (const entry of vertical.sitemapPaths) {
      entries.push({
        url: `${prefix}${entry.path}`,
        lastModified: new Date(),
        priority: entry.priority,
      });
    }

    // Location landing pages are a CA-specific content set today (lib/locations.ts).
    // Real estate gets its equivalent local-SEO surface from `localities`, added
    // to this sitemap once that table exists.
    if (client.vertical === "cafirm") {
      for (const location of LOCATION_PAGES) {
        entries.push({ url: `${prefix}/${location.slug}`, lastModified: new Date(), priority: 0.7 });
      }
    }

    const [serviceRows, updateRows] = await Promise.all([
      db
        .select()
        .from(services)
        .where(and(eq(services.clientId, client.id), eq(services.isActive, true))),
      db
        .select()
        .from(professionalUpdates)
        .where(
          and(
            eq(professionalUpdates.clientId, client.id),
            sql`${professionalUpdates.status} IN ('published','outdated')`,
          ),
        ),
    ]);

    for (const service of serviceRows) {
      entries.push({
        url: `${prefix}/services/${service.slug}`,
        lastModified: service.updatedAt,
        priority: 0.8,
      });
    }

    for (const update of updateRows) {
      entries.push({
        url: `${prefix}/updates/${update.slug}`,
        lastModified: update.updatedAt,
        priority: 0.6,
      });
    }
  }

  return entries;
}
