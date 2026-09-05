"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { getTenantPath } from "@/lib/templates";

export interface LookupState {
  error: string | null;
}

/**
 * The only way to reach a client's site from this dashboard — no listing is
 * ever rendered, so a signed-in team member still needs to know the exact
 * client ID to open it. Case/whitespace-insensitive since slugs are typed by
 * hand here, unlike everywhere else they're generated from a form.
 */
export async function lookupClient(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return { error: "Enter a client ID." };

  const [client] = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  if (!client || !client.isActive) {
    return { error: `No active client found with ID "${slug}".` };
  }

  redirect(getTenantPath(client.vertical, client.slug));
}
