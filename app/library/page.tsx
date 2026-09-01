import Image from "next/image";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { ArrowUpRight, Check } from "lucide-react";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { getVerticalConfig, type VerticalId } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Template Library — Gigzman",
  description: "Live, browsable website templates by business category.",
  // This page is a sales tool for pitching prospects, not a page meant to
  // rank — the same reasoning that keeps the deployment index at "/" out of
  // search results.
  robots: { index: false, follow: false },
};

interface TemplateEntry {
  vertical: VerticalId;
  image: { src: string; alt: string };
  includes: string[];
}

/**
 * What each template covers, for the card copy. Kept separate from
 * `VerticalConfig` because this wording is sales-facing, not app config.
 */
const TEMPLATES: TemplateEntry[] = [
  {
    vertical: "cafirm",
    image: { src: "/3d/dashboard.png", alt: "" },
    includes: [
      "Services, knowledge centre and FAQ pages",
      "ICAI-compliant footer and no-solicitation notice",
      "Income tax, TDS and GST calculators",
      "Compliance calendar with a live countdown",
      "Lead-capture query form feeding a lightweight CRM dashboard",
    ],
  },
  {
    vertical: "realestate",
    image: { src: "/verticals/realestate/photos/hero-inventory.webp", alt: "" },
    includes: [
      "Filterable property listings and detail pages",
      "Locality market pages (price/sq.ft, YoY change, rental yield)",
      "RERA registration status shown on every listing",
      "EMI, stamp duty and rental yield calculators",
      "Dashboard for managing inventory, photos and localities",
    ],
  },
];

export default async function LibraryPage() {
  const demoClients = await db
    .select()
    .from(clients)
    .where(and(eq(clients.isDemo, true), eq(clients.isActive, true)));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="eyebrow">Template library</p>
      <h1 className="display-lg mt-3">Ready-made websites, by category.</h1>
      <p className="prose-body mt-3 max-w-2xl text-[15px]">
        Each template below is a live, working site — not a mockup. Browse it the way a prospect
        would, then use it as the starting point for their build.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {TEMPLATES.map((template) => {
          const vertical = getVerticalConfig(template.vertical);
          const demo = demoClients.find((c) => c.vertical === template.vertical);

          return (
            <div
              key={template.vertical}
              className="overflow-hidden rounded-[14px] border border-line bg-surface"
            >
              <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-tint">
                <Image
                  src={template.image.src}
                  alt={template.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-accent">
                  {vertical.label}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{vertical.summary}</p>

                <ul className="mt-5 space-y-2">
                  {template.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ink-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                  {demo ? (
                    <>
                      <Link
                        href={`/${demo.vertical}/${demo.slug}`}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft"
                      >
                        View Live Demo
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/${demo.vertical}/${demo.slug}/dashboard`}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[8px] border border-line-strong px-4 text-[13px] font-medium text-navy hover:border-navy"
                      >
                        View Dashboard
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </>
                  ) : (
                    <p className="text-[12px] text-ink-subtle">
                      No demo tenant seeded yet for this template.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
