import type { MetadataRoute } from "next";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, services, professionalUpdates } from "@/lib/db/schema";
import { LOCATION_PAGES } from "@/lib/locations";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  { path: "", priority: 1 },
  { path: "/firm-profile", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/calculators", priority: 0.7 },
  { path: "/calculators/income-tax", priority: 0.6 },
  { path: "/calculators/tds", priority: 0.6 },
  { path: "/calculators/gst", priority: 0.6 },
  { path: "/updates", priority: 0.7 },
  { path: "/compliance-calendar", priority: 0.7 },
  { path: "/knowledge", priority: 0.6 },
  { path: "/faq", priority: 0.6 },
  { path: "/careers", priority: 0.5 },
  { path: "/contact", priority: 0.8 },
  { path: "/legal/privacy-policy", priority: 0.2 },
  { path: "/legal/terms-of-use", priority: 0.2 },
  { path: "/legal/disclaimer", priority: 0.2 },
  { path: "/legal/calculator-disclaimer", priority: 0.2 },
  { path: "/legal/cookie-notice", priority: 0.2 },
];

/**
 * Emits one entry set per hosted client. The dashboard, the deployment index and
 * the thank-you page are excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const activeClients = await db.select().from(clients).where(eq(clients.isActive, true));
  const entries: MetadataRoute.Sitemap = [];

  for (const client of activeClients) {
    const prefix = client.customDomain
      ? `https://${client.customDomain}`
      : `${base}/${client.vertical}/${client.slug}`;

    for (const entry of STATIC_PATHS) {
      entries.push({
        url: `${prefix}${entry.path}`,
        lastModified: new Date(),
        priority: entry.priority,
      });
    }

    for (const location of LOCATION_PAGES) {
      entries.push({ url: `${prefix}/${location.slug}`, lastModified: new Date(), priority: 0.7 });
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
