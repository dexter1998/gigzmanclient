CREATE TYPE "public"."property_purpose" AS ENUM('buy', 'rent');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('new_launch', 'under_construction', 'ready_to_move');--> statement-breakpoint
CREATE TABLE "localities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"slug" varchar(160) NOT NULL,
	"name" text NOT NULL,
	"corridor" varchar(120),
	"avg_price_per_sqft" integer,
	"yoy_change_percent" integer,
	"rental_yield_percent" integer,
	"active_projects" integer,
	"best_for" varchar(120),
	"description" text,
	"hero_image" text,
	"last_verified_at" date,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "localities_client_slug_unique" UNIQUE("client_id","slug")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" text NOT NULL,
	"property_type" varchar(40) NOT NULL,
	"purpose" "property_purpose" DEFAULT 'buy' NOT NULL,
	"status" "property_status" DEFAULT 'ready_to_move' NOT NULL,
	"price" integer,
	"price_label" text,
	"price_per_sqft" integer,
	"sector" varchar(40),
	"locality" varchar(120),
	"corridor" varchar(120),
	"beds" integer,
	"baths" integer,
	"area" integer,
	"area_unit" varchar(20) DEFAULT 'sqft',
	"badge" text,
	"developer" text,
	"rera_number" varchar(60),
	"description" text,
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"specs" jsonb DEFAULT '{}'::jsonb,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_client_slug_unique" UNIQUE("client_id","slug")
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"path" text NOT NULL,
	"alt" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "calculators" ALTER COLUMN "tax_year" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" SET DATA TYPE varchar(60);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "localities" ADD CONSTRAINT "localities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_client_email_unique" UNIQUE("client_id","email");--> statement-breakpoint
DROP TYPE "public"."service_category";