import type { MetadataRoute } from "next";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, services, professionalUpdates, properties, localities } from "@/lib/db/schema";
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

    // Location landing pages are a CA-specific content set (lib/locations.ts);
    // real estate's equivalent local-SEO surface is `localities`, added below.
    if (client.vertical === "cafirm") {
      for (const location of LOCATION_PAGES) {
        entries.push({ url: `${prefix}/${location.slug}`, lastModified: new Date(), priority: 0.7 });
      }
    }

    const [serviceRows, updateRows, propertyRows, localityRows] = await Promise.all([
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
      db
        .select()
        .from(properties)
        .where(and(eq(properties.clientId, client.id), eq(properties.isActive, true))),
      db
        .select()
        .from(localities)
        .where(and(eq(localities.clientId, client.id), eq(localities.isPublished, true))),
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

    for (const property of propertyRows) {
      entries.push({
        url: `${prefix}/properties/${property.slug}`,
        lastModified: property.updatedAt,
        priority: property.isFeatured ? 0.8 : 0.7,
      });
    }

    for (const locality of localityRows) {
      entries.push({
        url: `${prefix}/localities/${locality.slug}`,
        lastModified: locality.updatedAt,
        priority: 0.6,
      });
    }
  }

  return entries;
}
