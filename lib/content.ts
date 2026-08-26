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
