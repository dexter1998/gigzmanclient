import type { MetadataRoute } from "next";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, services, professionalUpdates, properties, localities } from "@/lib/db/schema";
import { LOCATION_PAGES } from "@/lib/locations";
import { getVerticalConfig } from "@/lib/verticals";
import { getTenantPath, getTemplateKeyForSlug } from "@/lib/templates";
import { LOAN_AMOUNTS, amountSlugStem } from "@/lib/home-loan/amounts";
import { homeLoanEnabled } from "@/lib/home-loan/enabled";
import { LENDERS } from "@/lib/home-loan/banks";
import { unitPairs, pairSlug } from "@/lib/calculators/area-units";
import { DIRECTIONS, ROOMS, VASTU_CONTEXTS } from "@/lib/vastu";
import { SECTORS, PLOT_SIZES, PROPERTY_CONTEXTS, sectorAspectSlugs } from "@/lib/vastu/sectors";

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
      : `${base}${getTenantPath(client.vertical, client.slug)}`;

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

    // Home-loan pages come from static config rather than a table, so none of
    // the DB queries below discover them — they are enumerated explicitly.
    if (homeLoanEnabled(client.slug)) {
      entries.push({ url: `${prefix}/home-loan`, lastModified: new Date(), priority: 0.7 });

      for (const amount of LOAN_AMOUNTS) {
        entries.push({
          url: `${prefix}/home-loan/${amount.slug}`,
          lastModified: new Date(),
          priority: 0.6,
        });
      }

      for (const lender of LENDERS) {
        entries.push({
          url: `${prefix}/home-loan/${lender.slug}`,
          lastModified: new Date(),
          priority: 0.6,
        });

        // The lender × amount matrix sits at a lower priority than either
        // parent — it is the widest and least differentiated layer.
        for (const amount of LOAN_AMOUNTS) {
          entries.push({
            url: `${prefix}/home-loan/${lender.slug}/${amountSlugStem(amount)}`,
            lastModified: new Date(),
            priority: 0.4,
          });
        }
      }
    }

    // Calculator/tool families are generated from static config, so they are
    // enumerated here for the same reason the home-loan set is.
    if (client.vertical === "realestate") {
      entries.push(
        { url: `${prefix}/area-converter`, lastModified: new Date(), priority: 0.6 },
        { url: `${prefix}/rental-yield`, lastModified: new Date(), priority: 0.7 },
        { url: `${prefix}/vastu`, lastModified: new Date(), priority: 0.7 },
      );
      for (const pair of unitPairs()) {
        entries.push({
          url: `${prefix}/area-converter/${pairSlug(pair.from, pair.to)}`,
          lastModified: new Date(),
          priority: 0.4,
        });
      }
      for (const direction of DIRECTIONS) {
        for (const context of VASTU_CONTEXTS) {
          entries.push({
            url: `${prefix}/vastu/${direction.slug}-facing-${context.slug}`,
            lastModified: new Date(),
            priority: 0.5,
          });
        }
      }
      for (const room of ROOMS) {
        entries.push({
          url: `${prefix}/vastu/${room.slug}-vastu`,
          lastModified: new Date(),
          priority: 0.5,
        });
        for (const direction of DIRECTIONS) {
          entries.push({
            url: `${prefix}/vastu/${room.slug}-in-${direction.slug}-vastu`,
            lastModified: new Date(),
            priority: 0.4,
          });
        }
      }
      for (const direction of DIRECTIONS) {
        for (const size of PLOT_SIZES) {
          entries.push({
            url: `${prefix}/vastu/${size}-plot-${direction.slug}-facing-vastu`,
            lastModified: new Date(),
            priority: 0.4,
          });
        }
        for (const context of PROPERTY_CONTEXTS) {
          entries.push({
            url: `${prefix}/vastu/${context.slug}-${direction.slug}-facing-vastu`,
            lastModified: new Date(),
            priority: 0.4,
          });
        }
      }

      // The Gurugram sector matrix only renders for the premium-v2 template,
      // so it is gated the same way the pages themselves are — listing it for
      // a client whose routes 404 would be a sitemap full of dead URLs.
      if (getTemplateKeyForSlug(client.slug) === "premium-v2") {
        entries.push({ url: `${prefix}/vastu/gurugram`, lastModified: new Date(), priority: 0.6 });
        const aspects = sectorAspectSlugs(
          DIRECTIONS.map((d) => d.slug),
          ROOMS.map((r) => r.slug),
        );
        for (const sector of SECTORS) {
          entries.push({
            url: `${prefix}/vastu/gurugram/${sector.slug}`,
            lastModified: new Date(),
            priority: 0.5,
          });
          for (const aspect of aspects) {
            entries.push({
              url: `${prefix}/vastu/gurugram/${sector.slug}/${aspect}`,
              lastModified: new Date(),
              priority: 0.3,
            });
          }
        }
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
      if (client.vertical === "realestate") {
        entries.push({
          url: `${prefix}/rental-yield/${locality.slug}`,
          lastModified: locality.updatedAt,
          priority: 0.6,
        });
      }
      entries.push({
        url: `${prefix}/localities/${locality.slug}`,
        lastModified: locality.updatedAt,
        priority: 0.6,
      });
    }
  }

  return entries;
}
