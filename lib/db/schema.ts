import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  date,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Every content table is scoped by `clientId` so a single deployment can serve
 * many client sites, resolved per-request from the tenant middleware.
 */

export const queryStatus = pgEnum("query_status", [
  "new",
  "contact_attempted",
  "connected",
  "qualified",
  "consultation_scheduled",
  "converted",
  "not_converted",
  "spam",
  "closed",
]);

export const notConvertedReason = pgEnum("not_converted_reason", [
  "no_response",
  "service_not_available",
  "budget_mismatch",
  "requirement_postponed",
  "selected_another_firm",
  "invalid_query",
  "duplicate",
  "other",
]);

export const clientType = pgEnum("client_type", [
  "individual",
  "salaried_professional",
  "proprietorship",
  "partnership_llp",
  "company",
  "startup",
  "other",
]);

export const contactMethod = pgEnum("contact_method", ["phone", "email", "whatsapp"]);

export const updateStatus = pgEnum("update_status", [
  "draft",
  "review_required",
  "approved",
  "published",
  "outdated",
  "archived",
]);

/** Mirrors the calculator lifecycle: rates must pass CA review before going Active. */
export const calculatorStatus = pgEnum("calculator_status", [
  "draft",
  "testing",
  "ca_review_required",
  "active",
  "update_required",
  "archived",
]);

export const serviceCategory = pgEnum("service_category", [
  "taxation",
  "gst",
  "audit_assurance",
  "business_corporate",
]);

export const userRole = pgEnum("user_role", ["admin", "editor"]);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  vertical: varchar("vertical", { length: 60 }).notNull().default("cafirm"),
  displayName: text("display_name").notNull(),
  customDomain: varchar("custom_domain", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const firmSettings = pgTable("firm_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" })
    .unique(),

  firmName: text("firm_name").notNull(),
  tagline: text("tagline"),
  overview: text("overview"),
  establishedYear: varchar("established_year", { length: 10 }),
  firmRegistrationNumber: varchar("firm_registration_number", { length: 60 }),

  // Single source of truth for NAP — footer, contact page, JSON-LD and map all read
  // from here so the site can never drift from the Google Business Profile.
  phone: varchar("phone", { length: 40 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  email: varchar("email", { length: 160 }),
  addressLine: text("address_line"),
  locality: varchar("locality", { length: 120 }),
  region: varchar("region", { length: 120 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 80 }).default("India"),
  latitude: varchar("latitude", { length: 32 }),
  longitude: varchar("longitude", { length: 32 }),
  googleMapsUrl: text("google_maps_url"),
  businessCategory: varchar("business_category", { length: 120 }),
  /** Path or URL to the firm's logo; falls back to the built-in mark when unset. */
  logoUrl: text("logo_url"),

  /** [{ day, opens, closes, closed }] — drives both the UI and openingHoursSpecification. */
  openingHours: jsonb("opening_hours").$type<OpeningHour[]>().default([]),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),

  ga4MeasurementId: varchar("ga4_measurement_id", { length: 40 }),
  searchConsoleVerification: text("search_console_verification"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  /**
   * Section visibility. `reviewsEnabled` ships false: ICAI's Code of Ethics
   * prohibits testimonials, star ratings and endorsements on a CA firm's own
   * site, so this stays off unless the firm's CA decides otherwise.
   */
  reviewsEnabled: boolean("reviews_enabled").notNull().default(false),
  pricingEnabled: boolean("pricing_enabled").notNull().default(true),
  awardsEnabled: boolean("awards_enabled").notNull().default(true),
  clientLogosEnabled: boolean("client_logos_enabled").notNull().default(true),
  teamEnabled: boolean("team_enabled").notNull().default(true),

  notificationEmail: varchar("notification_email", { length: 160 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OpeningHour = {
  day: string;
  opens: string | null;
  closes: string | null;
  closed: boolean;
};

export const officeLocations = pgTable("office_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  addressLine: text("address_line"),
  locality: varchar("locality", { length: 120 }),
  region: varchar("region", { length: 120 }),
  postalCode: varchar("postal_code", { length: 20 }),
  phone: varchar("phone", { length: 40 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  designation: text("designation"),
  qualifications: text("qualifications"),
  membershipNumber: varchar("membership_number", { length: 60 }),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 140 }).notNull(),
    title: text("title").notNull(),
    category: serviceCategory("category").notNull(),
    summary: text("summary"),

    overview: text("overview"),
    whoNeedsThis: jsonb("who_needs_this").$type<string[]>().default([]),
    scopeOfAssistance: jsonb("scope_of_assistance").$type<string[]>().default([]),
    documentsRequired: jsonb("documents_required").$type<string[]>().default([]),
    engagementProcess: jsonb("engagement_process").$type<ProcessStep[]>().default([]),
    timelines: text("timelines"),
    considerations: text("considerations"),
    faqs: jsonb("faqs").$type<Faq[]>().default([]),

    /** Services only a CA may render are tracked separately for compliance review. */
    isCaExclusive: boolean("is_ca_exclusive").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),

    reviewedBy: text("reviewed_by"),
    lastReviewedAt: date("last_reviewed_at"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("services_client_slug_unique").on(t.clientId, t.slug)],
);

export type ProcessStep = { step: string; detail: string };
export type Faq = { question: string; answer: string };

export const queries = pgTable("queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  reference: varchar("reference", { length: 24 }).notNull().unique(),

  name: text("name").notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 160 }),
  clientType: clientType("client_type"),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceLabel: text("service_label"),
  message: text("message"),
  preferredContact: contactMethod("preferred_contact"),

  leadSource: varchar("lead_source", { length: 80 }),
  landingPage: text("landing_page"),
  formName: varchar("form_name", { length: 80 }),
  /** Set when the query originated from a calculator CTA — never carries financial values. */
  calculatorId: varchar("calculator_id", { length: 60 }),
  calculatorVersion: varchar("calculator_version", { length: 30 }),
  taxYear: varchar("tax_year", { length: 60 }),

  status: queryStatus("status").notNull().default("new"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  assignedTo: text("assigned_to"),
  followUpDate: date("follow_up_date"),
  notConvertedReason: notConvertedReason("not_converted_reason"),

  marketingConsent: boolean("marketing_consent").notNull().default(false),
  consentText: text("consent_text"),
  consentAt: timestamp("consent_at", { withTimezone: true }),

  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
});

export const queryStatusHistory = pgTable("query_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryId: uuid("query_id")
    .notNull()
    .references(() => queries.id, { onDelete: "cascade" }),
  fromStatus: queryStatus("from_status"),
  toStatus: queryStatus("to_status").notNull(),
  reason: text("reason"),
  changedBy: text("changed_by"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const queryNotes = pgTable("query_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryId: uuid("query_id")
    .notNull()
    .references(() => queries.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  authorName: text("author_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const professionalUpdates = pgTable(
  "professional_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 180 }).notNull(),
    title: text("title").notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    excerpt: text("excerpt"),
    body: text("body"),

    /** Applicable period is mandatory for anything tax-year sensitive. */
    applicableYear: varchar("applicable_year", { length: 60 }),
    sources: jsonb("sources").$type<Source[]>().default([]),

    status: updateStatus("status").notNull().default("draft"),
    authorName: text("author_name"),
    reviewerName: text("reviewer_name"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastReviewedAt: date("last_reviewed_at"),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("updates_client_slug_unique").on(t.clientId, t.slug)],
);

export type Source = { label: string; url: string };

export const complianceEvents = pgTable("compliance_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  description: text("description"),
  applicableTo: text("applicable_to"),

  /**
   * `dueDate` is the original statutory date and is never overwritten; an
   * extension is recorded alongside it so the history stays auditable.
   */
  dueDate: date("due_date").notNull(),
  extendedDueDate: date("extended_due_date"),
  extensionNote: text("extension_note"),

  sourceLabel: text("source_label"),
  sourceUrl: text("source_url"),
  lastVerifiedAt: date("last_verified_at"),

  isRecurring: boolean("is_recurring").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calculators = pgTable(
  "calculators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    /** Stable key matching the implementation in lib/calculators/. */
    key: varchar("key", { length: 60 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),

    /** Formula version — rate tables live in code and are not editable from the dashboard. */
    version: varchar("version", { length: 30 }).notNull(),
    taxYear: varchar("tax_year", { length: 60 }).notNull(),
    status: calculatorStatus("status").notNull().default("ca_review_required"),

    reviewerName: text("reviewer_name"),
    lastReviewedAt: date("last_reviewed_at"),
    disclaimer: text("disclaimer"),
    sourceNote: text("source_note"),
    sortOrder: integer("sort_order").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("calculators_client_key_unique").on(t.clientId, t.key)],
);

export const legalPages = pgTable(
  "legal_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    lastReviewedAt: date("last_reviewed_at"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("legal_pages_client_slug_unique").on(t.clientId, t.slug)],
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  role: userRole("role").notNull().default("editor"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
