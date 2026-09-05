"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCardV2 from "./PropertyCardV2";
import type { properties } from "@/lib/db/schema";

type Property = typeof properties.$inferSelect;

/**
 * Filtering, sorting and pagination run in the browser rather than on the
 * server.
 *
 * The reason is caching, not preference: reading `searchParams` on the server
 * opts the whole route out of static rendering, so every visit to
 * /properties — including the unfiltered one, which is the one people
 * actually land on — paid a full round trip to a database in another region.
 * A client's live inventory is a few dozen rows, small enough to ship once
 * with the prerendered page, so the page is now served from the CDN and
 * filtering is instant instead of a network round trip per change.
 *
 * If inventory ever grows past a few hundred listings this trade flips, and
 * the filtering belongs back on the server behind a cached query.
 */
const PAGE_SIZE = 9;

export default function PropertyResultsV2({
  allProperties,
  imageMap,
  propertiesPath,
}: {
  allProperties: Property[];
  imageMap: Record<string, { path: string; alt: string | null } | undefined>;
  propertiesPath: string;
}) {
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const get = (key: string) => searchParams.get(key) ?? undefined;
    const type = get("type");
    const purpose = get("purpose");
    const status = get("status");
    const locality = get("locality");
    const beds = Number(get("beds")) || undefined;
    const maxPrice = Number(get("maxPrice")) || undefined;
    const search = get("search")?.trim().toLowerCase();
    const amenities = (get("amenities") ?? "").split(",").filter(Boolean);
    const verifiedOnly = get("verified") === "1";
    const sort = get("sort") ?? "";

    let list = allProperties.filter((property) => {
      if (type && property.propertyType !== type) return false;
      if ((purpose === "buy" || purpose === "rent") && property.purpose !== purpose) return false;
      if (status && property.status !== status) return false;
      if (locality && property.locality !== locality) return false;
      if (beds !== undefined && (property.beds ?? 0) < beds) return false;
      if (maxPrice !== undefined && (property.price ?? 0) > maxPrice) return false;
      if (verifiedOnly && !property.reraNumber) return false;
      if (amenities.length > 0) {
        const own = Array.isArray(property.amenities) ? (property.amenities as string[]) : [];
        if (!amenities.every((a) => own.includes(a))) return false;
      }
      if (search) {
        const haystack = [property.title, property.locality, property.sector, property.corridor]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === "price_desc") list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

    return list;
  }, [allProperties, searchParams]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number(searchParams.get("page")) || 1;
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) params.delete("page");
    else params.set("page", String(targetPage));
    const qs = params.toString();
    return `${propertiesPath}${qs ? `?${qs}` : ""}`;
  };

  if (filtered.length === 0) {
    return (
      <div>
        <p className="mb-4 text-[12.5px] text-[color:var(--gp-muted)]">0 properties found</p>
        <div className="rounded-[var(--gp-radius-md)] border border-dashed border-[color:var(--gp-border)] p-12 text-center">
          <p className="font-display text-[20px] text-[color:var(--gp-ink)]">
            No properties match these filters.
          </p>
          <p className="mt-2 text-[13.5px] text-[color:var(--gp-muted)]">
            Try clearing a filter or searching a different locality.
          </p>
          <Link
            href={propertiesPath}
            className="mt-5 inline-flex min-h-[46px] items-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13.5px] font-medium text-white"
          >
            Clear filters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-[12.5px] text-[color:var(--gp-muted)]">
        {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((property) => (
          <PropertyCardV2
            key={property.id}
            property={property}
            href={`${propertiesPath}/${property.slug}`}
            imagePath={imageMap[property.id]?.path}
            imageAlt={imageMap[property.id]?.alt ?? undefined}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          <Link
            href={pageHref(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gp-border)] ${
              currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:border-[color:var(--gp-gold-600)]"
            }`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <Link
                key={n}
                href={pageHref(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] ${
                  n === currentPage
                    ? "bg-[color:var(--gp-gold-600)] text-white"
                    : "border border-[color:var(--gp-border)] text-[color:var(--gp-ink)] hover:border-[color:var(--gp-gold-600)]"
                }`}
              >
                {n}
              </Link>
            );
          })}
          <Link
            href={pageHref(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gp-border)] ${
              currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:border-[color:var(--gp-gold-600)]"
            }`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
