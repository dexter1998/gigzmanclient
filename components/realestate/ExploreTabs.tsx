"use client";

import { useState } from "react";
import Link from "next/link";
import PropertyCard from "./PropertyCard";
import { joinPath } from "@/lib/paths";
import type { properties } from "@/lib/db/schema";

type Property = typeof properties.$inferSelect;

interface ExploreTabsProps {
  residential: Property[];
  commercial: Property[];
  images: Record<string, { path: string; alt: string | null } | undefined>;
  basePath: string;
}

/**
 * Client-side toggle only — both lists are already fetched server-side, so
 * switching tabs never refetches anything. Takes `basePath` rather than a
 * `hrefFor` function prop: Server Components can't pass closures to Client
 * Components, only serializable data.
 */
export default function ExploreTabs({ residential, commercial, images, basePath }: ExploreTabsProps) {
  const hrefFor = (slug: string) => joinPath(basePath, `/properties/${slug}`);
  const viewAllHref = joinPath(basePath, "/properties");
  const [tab, setTab] = useState<"residential" | "commercial">("residential");
  const active = tab === "residential" ? residential : commercial;

  return (
    <div>
      <div className="flex gap-6 border-b border-line">
        {(
          [
            { key: "residential", label: "Residential" },
            { key: "commercial", label: "Commercial" },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setTab(option.key)}
            className={`relative min-h-[40px] pb-2.5 text-[14px] transition-colors ${
              tab === option.key ? "font-semibold text-navy" : "text-ink-muted hover:text-navy"
            }`}
          >
            {option.label}
            {tab === option.key ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
            ) : null}
          </button>
        ))}
      </div>

      {active.length === 0 ? (
        <p className="mt-6 text-[13px] text-ink-subtle">No {tab} properties published yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {active.slice(0, 4).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              href={hrefFor(property.slug)}
              imagePath={images[property.id]?.path}
              imageAlt={images[property.id]?.alt ?? undefined}
            />
          ))}
        </div>
      )}

      <div className="mt-7 text-center">
        <Link
          href={viewAllHref}
          className="inline-flex min-h-[44px] items-center rounded-[6px] border border-line-strong px-6 text-[13.5px] font-medium text-navy hover:border-navy"
        >
          View all {tab === "residential" ? "Residential" : "Commercial"} Properties
        </Link>
      </div>
    </div>
  );
}
