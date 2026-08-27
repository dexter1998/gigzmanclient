"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  queries,
  queryStatusHistory,
  queryNotes,
  professionalUpdates,
  complianceEvents,
  calculators,
  firmSettings,
  services,
} from "@/lib/db/schema";
import { requireUser, requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

/**
 * Every action re-checks authentication and tenant ownership. A Server Action is
 * a reachable POST endpoint, so the dashboard layout having rendered proves
 * nothing about the caller.
 */
async function assertOwnership<T extends { clientId: string }>(
  row: T | undefined,
  clientId: string,
): Promise<T> {
  if (!row || row.clientId !== clientId) throw new Error("Record not found");
  return row;
}

function fail(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return { ok: false, message };
}

// ─────────────────────────────────────────────────────────────── queries

export async function updateQueryStatus(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id"));
    const toStatus = String(formData.get("status")) as typeof queries.$inferSelect.status;
    const reason = String(formData.get("reason") ?? "").trim() || null;
    const notConvertedReason = String(formData.get("notConvertedReason") ?? "").trim();

    const [existing] = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
    await assertOwnership(existing, user.clientId);

    if (toStatus === "not_converted" && !notConvertedReason) {
      return { ok: false, message: "Select a reason before marking a query not converted." };
    }

    await db
      .update(queries)
      .set({
        status: toStatus,
        notConvertedReason:
          toStatus === "not_converted"
            ? (notConvertedReason as typeof queries.$inferSelect.notConvertedReason)
            : null,
        lastActivityAt: new Date(),
      })
      .where(eq(queries.id, id));

    await db.insert(queryStatusHistory).values({
      queryId: id,
      fromStatus: existing.status,
      toStatus,
      reason,
      changedBy: user.name ?? user.email,
    });

    revalidatePath("/site/dashboard/queries");
    return { ok: true, message: "Status updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function updateQueryDetails(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id"));

    const [existing] = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
    await assertOwnership(existing, user.clientId);

    const followUpDate = String(formData.get("followUpDate") ?? "").trim();
    const assignedTo = String(formData.get("assignedTo") ?? "").trim();
    const priority = String(formData.get("priority") ?? "normal").trim();

    await db
      .update(queries)
      .set({
        followUpDate: followUpDate || null,
        assignedTo: assignedTo || null,
        priority,
        lastActivityAt: new Date(),
      })
      .where(eq(queries.id, id));

    revalidatePath("/site/dashboard/queries");
    return { ok: true, message: "Query updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function addQueryNote(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id"));
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return { ok: false, message: "Enter a note before saving." };

    const [existing] = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
    await assertOwnership(existing, user.clientId);

    await db.insert(queryNotes).values({
      queryId: id,
      body,
      authorName: user.name ?? user.email,
    });

    await db.update(queries).set({ lastActivityAt: new Date() }).where(eq(queries.id, id));

    revalidatePath("/site/dashboard/queries");
    return { ok: true, message: "Note added." };
  } catch (error) {
    return fail(error);
  }
}

export async function archiveQuery(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id"));

    const [existing] = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
    await assertOwnership(existing, user.clientId);

    // Archived rather than deleted so the enquiry history stays auditable.
    await db
      .update(queries)
      .set({ isArchived: !existing.isArchived, lastActivityAt: new Date() })
      .where(eq(queries.id, id));

    revalidatePath("/site/dashboard/queries");
    return { ok: true, message: existing.isArchived ? "Query restored." : "Query archived." };
  } catch (error) {
    return fail(error);
  }
}

// ─────────────────────────────────────────────────────────────── updates

export async function saveUpdate(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id") ?? "").trim();

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const status = String(formData.get("status") ?? "draft") as
      typeof professionalUpdates.$inferSelect.status;
    const applicableYear = String(formData.get("applicableYear") ?? "").trim();
    const reviewerName = String(formData.get("reviewerName") ?? "").trim();
    const sourceLabel = String(formData.get("sourceLabel") ?? "").trim();
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();

    if (!title) return { ok: false, message: "A title is required." };
    if (!category) return { ok: false, message: "A category is required." };

    // Publishing requires the provenance fields the editorial rules mandate.
    if (status === "published") {
      if (!reviewerName) {
        return { ok: false, message: "A reviewer is required before publishing." };
      }
      if (!sourceUrl) {
        return { ok: false, message: "A source reference is required before publishing." };
      }
      if (!applicableYear) {
        return { ok: false, message: "An applicable period is required before publishing." };
      }
    }

    const values = {
      title,
      category,
      status,
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      body: String(formData.get("body") ?? "") || null,
      applicableYear: applicableYear || null,
      authorName: String(formData.get("authorName") ?? "").trim() || null,
      reviewerName: reviewerName || null,
      sources: sourceUrl ? [{ label: sourceLabel || "Source", url: sourceUrl }] : [],
      publishedAt: status === "published" ? new Date() : null,
      updatedAt: new Date(),
    };

    if (id) {
      const [existing] = await db
        .select()
        .from(professionalUpdates)
        .where(eq(professionalUpdates.id, id))
        .limit(1);
      await assertOwnership(existing, user.clientId);

      await db
        .update(professionalUpdates)
        .set({
          ...values,
          // Keep the original publication date once it has been set.
          publishedAt: existing.publishedAt ?? values.publishedAt,
        })
        .where(eq(professionalUpdates.id, id));
    } else {
      await db.insert(professionalUpdates).values({
        ...values,
        clientId: user.clientId,
        slug: slugify(title),
      });
    }

    revalidatePath("/site/dashboard/updates");
    revalidatePath("/site/updates");
    return { ok: true, message: "Update saved." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteUpdate(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const id = String(formData.get("id"));

    const [existing] = await db
      .select()
      .from(professionalUpdates)
      .where(eq(professionalUpdates.id, id))
      .limit(1);
    await assertOwnership(existing, user.clientId);

    await db
      .update(professionalUpdates)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(professionalUpdates.id, id));

    revalidatePath("/site/dashboard/updates");
    revalidatePath("/site/updates");
    return { ok: true, message: "Update archived." };
  } catch (error) {
    return fail(error);
  }
}

// ────────────────────────────────────────────────────────────── compliance

export async function saveComplianceEvent(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id") ?? "").trim();

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const dueDate = String(formData.get("dueDate") ?? "").trim();

    if (!title || !category || !dueDate) {
      return { ok: false, message: "Title, category and due date are required." };
    }

    const extendedDueDate = String(formData.get("extendedDueDate") ?? "").trim();

    const values = {
      title,
      category,
      description: String(formData.get("description") ?? "").trim() || null,
      applicableTo: String(formData.get("applicableTo") ?? "").trim() || null,
      // The original statutory date is never overwritten by an extension.
      dueDate,
      extendedDueDate: extendedDueDate || null,
      extensionNote: String(formData.get("extensionNote") ?? "").trim() || null,
      sourceLabel: String(formData.get("sourceLabel") ?? "").trim() || null,
      sourceUrl: String(formData.get("sourceUrl") ?? "").trim() || null,
      lastVerifiedAt: String(formData.get("lastVerifiedAt") ?? "").trim() || null,
      isPublished: formData.get("isPublished") === "on",
    };

    if (id) {
      const [existing] = await db
        .select()
        .from(complianceEvents)
        .where(eq(complianceEvents.id, id))
        .limit(1);
      await assertOwnership(existing, user.clientId);
      await db.update(complianceEvents).set(values).where(eq(complianceEvents.id, id));
    } else {
      await db.insert(complianceEvents).values({ ...values, clientId: user.clientId });
    }

    revalidatePath("/site/dashboard/compliance");
    revalidatePath("/site/compliance-calendar");
    revalidatePath("/site");
    return { ok: true, message: "Compliance date saved." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteComplianceEvent(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id"));

    const [existing] = await db
      .select()
      .from(complianceEvents)
      .where(eq(complianceEvents.id, id))
      .limit(1);
    await assertOwnership(existing, user.clientId);

    await db.delete(complianceEvents).where(eq(complianceEvents.id, id));

    revalidatePath("/site/dashboard/compliance");
    revalidatePath("/site/compliance-calendar");
    return { ok: true, message: "Compliance date removed." };
  } catch (error) {
    return fail(error);
  }
}

// ───────────────────────────────────────────────────────────── calculators

export async function updateCalculator(formData: FormData): Promise<ActionResult> {
  try {
    // Promoting a calculator to active asserts the rates have been professionally
    // verified, so it is restricted to administrators.
    const user = await requireAdmin();
    const id = String(formData.get("id"));
    const status = String(formData.get("status")) as typeof calculators.$inferSelect.status;
    const reviewerName = String(formData.get("reviewerName") ?? "").trim();

    const [existing] = await db.select().from(calculators).where(eq(calculators.id, id)).limit(1);
    await assertOwnership(existing, user.clientId);

    if (status === "active" && !reviewerName) {
      return {
        ok: false,
        message: "Record who verified the rates before marking a calculator active.",
      };
    }

    await db
      .update(calculators)
      .set({
        status,
        reviewerName: reviewerName || null,
        disclaimer: String(formData.get("disclaimer") ?? "").trim() || existing.disclaimer,
        lastReviewedAt:
          status === "active" ? new Date().toISOString().slice(0, 10) : existing.lastReviewedAt,
        updatedAt: new Date(),
      })
      .where(eq(calculators.id, id));

    revalidatePath("/site/dashboard/calculators");
    revalidatePath("/site/calculators");
    return { ok: true, message: "Calculator updated." };
  } catch (error) {
    return fail(error);
  }
}

// ──────────────────────────────────────────────────────────────── settings

export async function updateFirmSettings(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();

    const firmName = String(formData.get("firmName") ?? "").trim();
    if (!firmName) return { ok: false, message: "The firm name is required." };

    await db
      .update(firmSettings)
      .set({
        firmName,
        tagline: String(formData.get("tagline") ?? "").trim() || null,
        overview: String(formData.get("overview") ?? "").trim() || null,
        establishedYear: String(formData.get("establishedYear") ?? "").trim() || null,
        firmRegistrationNumber:
          String(formData.get("firmRegistrationNumber") ?? "").trim() || null,
        businessCategory: String(formData.get("businessCategory") ?? "").trim() || null,
        logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
        email: String(formData.get("email") ?? "").trim() || null,
        addressLine: String(formData.get("addressLine") ?? "").trim() || null,
        locality: String(formData.get("locality") ?? "").trim() || null,
        region: String(formData.get("region") ?? "").trim() || null,
        postalCode: String(formData.get("postalCode") ?? "").trim() || null,
        latitude: String(formData.get("latitude") ?? "").trim() || null,
        longitude: String(formData.get("longitude") ?? "").trim() || null,
        googleMapsUrl: String(formData.get("googleMapsUrl") ?? "").trim() || null,
        seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
        seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
        ga4MeasurementId: String(formData.get("ga4MeasurementId") ?? "").trim() || null,
        notificationEmail: String(formData.get("notificationEmail") ?? "").trim() || null,
        reviewsEnabled: formData.get("reviewsEnabled") === "on",
        pricingEnabled: formData.get("pricingEnabled") === "on",
        awardsEnabled: formData.get("awardsEnabled") === "on",
        clientLogosEnabled: formData.get("clientLogosEnabled") === "on",
        teamEnabled: formData.get("teamEnabled") === "on",
        updatedAt: new Date(),
      })
      .where(eq(firmSettings.clientId, user.clientId));

    revalidatePath("/site/dashboard/settings");
    revalidatePath("/site");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleService(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id"));

    const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);
    await assertOwnership(existing, user.clientId);

    await db
      .update(services)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.clientId, user.clientId)));

    revalidatePath("/site/dashboard/settings");
    revalidatePath("/site/services");
    return { ok: true, message: existing.isActive ? "Service hidden." : "Service published." };
  } catch (error) {
    return fail(error);
  }
}
