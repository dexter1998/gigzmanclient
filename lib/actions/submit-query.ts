"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { queries, queryStatusHistory, clients, services } from "@/lib/db/schema";

export interface QueryFormState {
  ok: boolean;
  reference?: string;
  message?: string;
  errors?: Record<string, string>;
}

const CLIENT_TYPES = [
  "individual",
  "salaried_professional",
  "proprietorship",
  "partnership_llp",
  "company",
  "startup",
  "other",
] as const;

const CONTACT_METHODS = ["phone", "email", "whatsapp"] as const;

/** Fields the form must never accept, mirrored from the published privacy policy. */
const PROHIBITED_PATTERNS = [
  { pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/, label: "PAN" },
  { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/, label: "Aadhaar" },
];

function reference(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `Q-${stamp}-${rand}`;
}

export async function submitQuery(
  _prev: QueryFormState,
  formData: FormData,
): Promise<QueryFormState> {
  const h = await headers();
  const tenantSlug = h.get("x-tenant");
  const tenantHost = h.get("x-tenant-host");

  // A Server Action is a POST to its own route and is directly reachable, so the
  // tenant is resolved here rather than trusted from the client payload.
  let clientId: string | null = null;
  if (tenantSlug) {
    const [row] = await db.select().from(clients).where(eq(clients.slug, tenantSlug)).limit(1);
    clientId = row?.id ?? null;
  } else if (tenantHost) {
    const [row] = await db
      .select()
      .from(clients)
      .where(eq(clients.customDomain, tenantHost))
      .limit(1);
    clientId = row?.id ?? null;
  }

  if (!clientId) {
    return { ok: false, message: "This form is not available right now." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const clientType = String(formData.get("clientType") ?? "").trim();
  const serviceSlug = String(formData.get("service") ?? "").trim();
  const preferredContact = String(formData.get("preferredContact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";
  const marketingConsent = formData.get("marketingConsent") === "on";
  const landingPage = String(formData.get("landingPage") ?? "").slice(0, 500);
  const calculatorId = String(formData.get("calculatorId") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "").trim();

  // Bots fill every field; a hidden one that humans never see filters most of them.
  if (honeypot) return { ok: true, reference: reference() };

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Enter your name.";
  if (name.length > 120) errors.name = "Name is too long.";

  if (!phone && !email) {
    errors.phone = "Provide a phone number or an email address.";
  }
  if (phone && !/^[+\d][\d\s-]{7,19}$/.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (message.length > 2000) errors.message = "Message is too long.";
  if (!consent) errors.consent = "Please confirm before submitting.";

  for (const { pattern, label } of PROHIBITED_PATTERNS) {
    if (pattern.test(message)) {
      errors.message = `Please remove the ${label} from your message. Identification numbers are never collected through this form.`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Please correct the highlighted fields." };
  }

  let serviceId: string | null = null;
  let serviceLabel: string | null = null;
  if (serviceSlug) {
    const [row] = await db
      .select()
      .from(services)
      .where(and(eq(services.clientId, clientId), eq(services.slug, serviceSlug)))
      .limit(1);
    serviceId = row?.id ?? null;
    serviceLabel = row?.title ?? null;
  }

  const ref = reference();

  const [created] = await db
    .insert(queries)
    .values({
      clientId,
      reference: ref,
      name,
      phone: phone || null,
      email: email || null,
      clientType: (CLIENT_TYPES as readonly string[]).includes(clientType)
        ? (clientType as (typeof CLIENT_TYPES)[number])
        : null,
      serviceId,
      serviceLabel,
      message: message || null,
      preferredContact: (CONTACT_METHODS as readonly string[]).includes(preferredContact)
        ? (preferredContact as (typeof CONTACT_METHODS)[number])
        : null,
      leadSource: calculatorId ? "calculator" : "website",
      landingPage: landingPage || null,
      formName: calculatorId ? "calculator_cta" : "contact_form",
      // Only the calculator's identity travels with the lead — never any figure
      // that was entered into it.
      calculatorId: calculatorId || null,
      marketingConsent,
      consentText:
        "Consented to being contacted about this enquiry using the details provided.",
      consentAt: new Date(),
    })
    .returning();

  await db.insert(queryStatusHistory).values({
    queryId: created.id,
    toStatus: "new",
    reason: "Submitted through the website",
    changedBy: "website",
  });

  return { ok: true, reference: ref };
}
