import { cache } from "react";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  firmSettings,
  services,
  complianceEvents,
  professionalUpdates,
  legalPages,
  calculators,
  teamMembers,
  properties,
  propertyImages,
  localities,
} from "@/lib/db/schema";
import { todayInIst } from "@/lib/format";

/**
 * Read-side data access for the public site. Every function is scoped by
 * `clientId` and wrapped in `cache` so repeated calls within one request
 * collapse into a single query.
 */

export const getFirmSettings = cache(async (clientId: string) => {
  const [row] = await db
    .select()
    .from(firmSettings)
    .where(eq(firmSettings.clientId, clientId))
    .limit(1);
  return row ?? null;
});

export const getTeam = cache(async (clientId: string) =>
  db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.clientId, clientId), eq(teamMembers.isActive, true)))
    .orderBy(asc(teamMembers.sortOrder)),
);

export const getServices = cache(async (clientId: string) =>
  db
    .select()
    .from(services)
    .where(and(eq(services.clientId, clientId), eq(services.isActive, true)))
    .orderBy(asc(services.sortOrder)),
);

export const getAllServices = cache(async (clientId: string) =>
  db.select().from(services).where(eq(services.clientId, clientId)).orderBy(asc(services.sortOrder)),
);

export const getService = cache(async (clientId: string, slug: string) => {
  const [row] = await db
    .select()
    .from(services)
    .where(
      and(eq(services.clientId, clientId), eq(services.slug, slug), eq(services.isActive, true)),
    )
    .limit(1);
  return row ?? null;
});

export const getUpcomingCompliance = cache(async (clientId: string) =>
  db
    .select()
    .from(complianceEvents)
    .where(
      and(
        eq(complianceEvents.clientId, clientId),
        eq(complianceEvents.isPublished, true),
        gte(sql`COALESCE(${complianceEvents.extendedDueDate}, ${complianceEvents.dueDate})`, todayInIst()),
      ),
    )
    .orderBy(
      asc(sql`COALESCE(${complianceEvents.extendedDueDate}, ${complianceEvents.dueDate})`),
    ),
);

export const getPastCompliance = cache(async (clientId: string) =>
  db
    .select()
    .from(complianceEvents)
    .where(
      and(
        eq(complianceEvents.clientId, clientId),
        eq(complianceEvents.isPublished, true),
        sql`COALESCE(${complianceEvents.extendedDueDate}, ${complianceEvents.dueDate}) < ${todayInIst()}`,
      ),
    )
    .orderBy(
      desc(sql`COALESCE(${complianceEvents.extendedDueDate}, ${complianceEvents.dueDate})`),
    )
    .limit(20),
);

export const getAllCompliance = cache(async (clientId: string) =>
  db
    .select()
    .from(complianceEvents)
    .where(eq(complianceEvents.clientId, clientId))
    .orderBy(desc(complianceEvents.dueDate)),
);

/** The single deadline shown in the announcement bar and mobile popup. */
export const getNextDeadline = cache(async (clientId: string) => {
  const upcoming = await getUpcomingCompliance(clientId);
  return upcoming[0] ?? null;
});

export const getPublishedUpdates = cache(async (clientId: string) =>
  db
    .select()
    .from(professionalUpdates)
    .where(
      and(
        eq(professionalUpdates.clientId, clientId),
        sql`${professionalUpdates.status} IN ('published', 'outdated')`,
      ),
    )
    .orderBy(desc(professionalUpdates.publishedAt)),
);

export const getAllUpdates = cache(async (clientId: string) =>
  db
    .select()
    .from(professionalUpdates)
    .where(eq(professionalUpdates.clientId, clientId))
    .orderBy(desc(professionalUpdates.updatedAt)),
);

export const getUpdate = cache(async (clientId: string, slug: string) => {
  const [row] = await db
    .select()
    .from(professionalUpdates)
    .where(and(eq(professionalUpdates.clientId, clientId), eq(professionalUpdates.slug, slug)))
    .limit(1);
  return row ?? null;
});

export const getLegalPage = cache(async (clientId: string, slug: string) => {
  const [row] = await db
    .select()
    .from(legalPages)
    .where(and(eq(legalPages.clientId, clientId), eq(legalPages.slug, slug)))
    .limit(1);
  return row ?? null;
});

export const getCalculators = cache(async (clientId: string) =>
  db
    .select()
    .from(calculators)
    .where(eq(calculators.clientId, clientId))
    .orderBy(asc(calculators.sortOrder)),
);

export const getCalculator = cache(async (clientId: string, key: string) => {
  const [row] = await db
    .select()
    .from(calculators)
    .where(and(eq(calculators.clientId, clientId), eq(calculators.key, key)))
    .limit(1);
  return row ?? null;
});

// ───────────────────────────────────────────────────────── real-estate vertical

export interface PropertyFilters {
  propertyType?: string;
  purpose?: "buy" | "rent";
  locality?: string;
  minBeds?: number;
  maxPrice?: number;
  /** Free-text match against title, locality, sector and corridor. */
  search?: string;
}

/**
 * Not `cache()`-wrapped: filter combinations are effectively unbounded (query
 * string driven), so caching every distinct combination for the life of the
 * request would grow unbounded instead of collapsing repeats the way the
 * other cached lookups do.
 */
export async function getProperties(clientId: string, filters: PropertyFilters = {}) {
  const conditions = [eq(properties.clientId, clientId), eq(properties.isActive, true)];

  if (filters.propertyType) conditions.push(eq(properties.propertyType, filters.propertyType));
  if (filters.purpose) conditions.push(eq(properties.purpose, filters.purpose));
  if (filters.locality) conditions.push(eq(properties.locality, filters.locality));
  if (filters.minBeds !== undefined) conditions.push(gte(properties.beds, filters.minBeds));
  if (filters.maxPrice !== undefined) conditions.push(sql`${properties.price} <= ${filters.maxPrice}`);
  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      sql`(${properties.title} ILIKE ${term} OR ${properties.locality} ILIKE ${term} OR ${properties.sector} ILIKE ${term} OR ${properties.corridor} ILIKE ${term})`,
    );
  }

  return db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.isFeatured), asc(properties.sortOrder));
}

export const getFeaturedProperties = cache(async (clientId: string, limit = 6) =>
  db
    .select()
    .from(properties)
    .where(and(eq(properties.clientId, clientId), eq(properties.isActive, true)))
    .orderBy(desc(properties.isFeatured), asc(properties.sortOrder))
    .limit(limit),
);

export const getProperty = cache(async (clientId: string, slug: string) => {
  const [row] = await db
    .select()
    .from(properties)
    .where(
      and(eq(properties.clientId, clientId), eq(properties.slug, slug), eq(properties.isActive, true)),
    )
    .limit(1);
  return row ?? null;
});

export const getAllProperties = cache(async (clientId: string) =>
  db
    .select()
    .from(properties)
    .where(eq(properties.clientId, clientId))
    .orderBy(desc(properties.isFeatured), asc(properties.sortOrder)),
);

export const getPropertyImages = cache(async (propertyId: string) =>
  db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder)),
);

/** Distinct locality values actually in use, for the filter control. */
export const getPropertyLocalityFacets = cache(async (clientId: string) => {
  const rows = await db
    .selectDistinct({ locality: properties.locality })
    .from(properties)
    .where(and(eq(properties.clientId, clientId), eq(properties.isActive, true)));
  return rows.map((r) => r.locality).filter((v): v is string => Boolean(v));
});

export const getLocalities = cache(async (clientId: string) =>
  db
    .select()
    .from(localities)
    .where(and(eq(localities.clientId, clientId), eq(localities.isPublished, true)))
    .orderBy(asc(localities.sortOrder)),
);

export const getAllLocalities = cache(async (clientId: string) =>
  db.select().from(localities).where(eq(localities.clientId, clientId)).orderBy(asc(localities.sortOrder)),
);

export const getLocality = cache(async (clientId: string, slug: string) => {
  const [row] = await db
    .select()
    .from(localities)
    .where(
      and(eq(localities.clientId, clientId), eq(localities.slug, slug), eq(localities.isPublished, true)),
    )
    .limit(1);
  return row ?? null;
});
