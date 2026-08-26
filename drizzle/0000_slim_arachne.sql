CREATE TYPE "public"."calculator_status" AS ENUM('draft', 'testing', 'ca_review_required', 'active', 'update_required', 'archived');--> statement-breakpoint
CREATE TYPE "public"."client_type" AS ENUM('individual', 'salaried_professional', 'proprietorship', 'partnership_llp', 'company', 'startup', 'other');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('phone', 'email', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."not_converted_reason" AS ENUM('no_response', 'service_not_available', 'budget_mismatch', 'requirement_postponed', 'selected_another_firm', 'invalid_query', 'duplicate', 'other');--> statement-breakpoint
CREATE TYPE "public"."query_status" AS ENUM('new', 'contact_attempted', 'connected', 'qualified', 'consultation_scheduled', 'converted', 'not_converted', 'spam', 'closed');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('taxation', 'gst', 'audit_assurance', 'business_corporate');--> statement-breakpoint
CREATE TYPE "public"."update_status" AS ENUM('draft', 'review_required', 'approved', 'published', 'outdated', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "calculators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"key" varchar(60) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"version" varchar(30) NOT NULL,
	"tax_year" varchar(20) NOT NULL,
	"status" "calculator_status" DEFAULT 'ca_review_required' NOT NULL,
	"reviewer_name" text,
	"last_reviewed_at" date,
	"disclaimer" text,
	"source_note" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calculators_client_key_unique" UNIQUE("client_id","key")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"vertical" varchar(60) DEFAULT 'cafirm' NOT NULL,
	"display_name" text NOT NULL,
	"custom_domain" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "compliance_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" varchar(60) NOT NULL,
	"description" text,
	"applicable_to" text,
	"due_date" date NOT NULL,
	"extended_due_date" date,
	"extension_note" text,
	"source_label" text,
	"source_url" text,
	"last_verified_at" date,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"firm_name" text NOT NULL,
	"tagline" text,
	"overview" text,
	"established_year" varchar(10),
	"firm_registration_number" varchar(60),
	"phone" varchar(40),
	"whatsapp" varchar(40),
	"email" varchar(160),
	"address_line" text,
	"locality" varchar(120),
	"region" varchar(120),
	"postal_code" varchar(20),
	"country" varchar(80) DEFAULT 'India',
	"latitude" varchar(32),
	"longitude" varchar(32),
	"google_maps_url" text,
	"business_category" varchar(120),
	"opening_hours" jsonb DEFAULT '[]'::jsonb,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"ga4_measurement_id" varchar(40),
	"search_console_verification" text,
	"seo_title" text,
	"seo_description" text,
	"reviews_enabled" boolean DEFAULT false NOT NULL,
	"pricing_enabled" boolean DEFAULT true NOT NULL,
	"awards_enabled" boolean DEFAULT true NOT NULL,
	"client_logos_enabled" boolean DEFAULT true NOT NULL,
	"team_enabled" boolean DEFAULT true NOT NULL,
	"notification_email" varchar(160),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "firm_settings_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "legal_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"slug" varchar(80) NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"last_reviewed_at" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legal_pages_client_slug_unique" UNIQUE("client_id","slug")
);
--> statement-breakpoint
CREATE TABLE "office_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"label" text NOT NULL,
	"address_line" text,
	"locality" varchar(120),
	"region" varchar(120),
	"postal_code" varchar(20),
	"phone" varchar(40),
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"slug" varchar(180) NOT NULL,
	"title" text NOT NULL,
	"category" varchar(60) NOT NULL,
	"excerpt" text,
	"body" text,
	"applicable_year" varchar(20),
	"sources" jsonb DEFAULT '[]'::jsonb,
	"status" "update_status" DEFAULT 'draft' NOT NULL,
	"author_name" text,
	"reviewer_name" text,
	"published_at" timestamp with time zone,
	"last_reviewed_at" date,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "updates_client_slug_unique" UNIQUE("client_id","slug")
);
--> statement-breakpoint
CREATE TABLE "queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"reference" varchar(24) NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(40),
	"email" varchar(160),
	"client_type" "client_type",
	"service_id" uuid,
	"service_label" text,
	"message" text,
	"preferred_contact" "contact_method",
	"lead_source" varchar(80),
	"landing_page" text,
	"form_name" varchar(80),
	"calculator_id" varchar(60),
	"calculator_version" varchar(30),
	"tax_year" varchar(20),
	"status" "query_status" DEFAULT 'new' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal',
	"assigned_to" text,
	"follow_up_date" date,
	"not_converted_reason" "not_converted_reason",
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"consent_text" text,
	"consent_at" timestamp with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "queries_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "query_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "query_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_id" uuid NOT NULL,
	"from_status" "query_status",
	"to_status" "query_status" NOT NULL,
	"reason" text,
	"changed_by" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"slug" varchar(140) NOT NULL,
	"title" text NOT NULL,
	"category" "service_category" NOT NULL,
	"summary" text,
	"overview" text,
	"who_needs_this" jsonb DEFAULT '[]'::jsonb,
	"scope_of_assistance" jsonb DEFAULT '[]'::jsonb,
	"documents_required" jsonb DEFAULT '[]'::jsonb,
	"engagement_process" jsonb DEFAULT '[]'::jsonb,
	"timelines" text,
	"considerations" text,
	"faqs" jsonb DEFAULT '[]'::jsonb,
	"is_ca_exclusive" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"reviewed_by" text,
	"last_reviewed_at" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_client_slug_unique" UNIQUE("client_id","slug")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"designation" text,
	"qualifications" text,
	"membership_number" varchar(60),
	"bio" text,
	"photo_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calculators" ADD CONSTRAINT "calculators_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_events" ADD CONSTRAINT "compliance_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_settings" ADD CONSTRAINT "firm_settings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_pages" ADD CONSTRAINT "legal_pages_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_locations" ADD CONSTRAINT "office_locations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_updates" ADD CONSTRAINT "professional_updates_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queries" ADD CONSTRAINT "queries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queries" ADD CONSTRAINT "queries_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "query_notes" ADD CONSTRAINT "query_notes_query_id_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."queries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "query_status_history" ADD CONSTRAINT "query_status_history_query_id_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."queries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;