"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MAP_AREAS, mapImageSrc } from "@/lib/maps/areas";
import blurPlaceholders from "@/lib/maps/blur-placeholders.json";
import { analytics } from "@/lib/analytics";
import { GpContainer, GpEyebrow, GpSection } from "../gp-primitives";

const BLUR = blurPlaceholders as Record<string, string>;

/**
 * Homepage rail of plot maps.
 *
 * Scroll-snap plus a drag-free arrow pair rather than a carousel library —
 * the same hand-rolled approach the other strips on this page use, and it
 * keeps the row a plain scrollable list for touch and keyboard.
 *
 * `min-w-0` on the track is load-bearing: a grid/flex child defaults to
 * `min-width: auto`, which stops it shrinking and pushes the overflow out of
 * the container instead of scrolling inside it.
 */
export default function MapsCarouselV2({
  basePath,
  areas = MAP_AREAS.slice(0, 14),
}: {
  basePath: string;
  areas?: typeof MAP_AREAS;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };

  const href = (path: string) => `${basePath}${path}`.replace(/\/{2,}/g, "/") || "/";

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <GpEyebrow>Plot maps</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Find your plot on the sector map
            </h2>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              Sector and colony layouts with plot numbers and block letters. Open any map full
              screen and zoom — it stays sharp, so the numbering is actually readable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous maps"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="More maps"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-8 min-w-0">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={href(`/maps/gurgaon/${area.slug}`)}
                onClick={() => analytics.ctaClick(`map_card_${area.slug}`, "home", "maps_carousel")}
                className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white transition-colors hover:border-[color:var(--gp-gold-600)] sm:w-[300px]"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-[color:var(--gp-cream-200)]">
                  <Image
                    src={mapImageSrc(area.slug)}
                    alt={`${area.name} plot map`}
                    fill
                    sizes="300px"
                    quality={68}
                    placeholder={BLUR[area.slug] ? "blur" : "empty"}
                    blurDataURL={BLUR[area.slug]}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <h3 className="font-display truncate text-[15px] text-[color:var(--gp-ink)]">
                    {area.name}
                  </h3>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)] transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href={href("/maps/gurgaon")}
            onClick={() => analytics.ctaClick("maps_view_all", "home", "maps_carousel")}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-forest-950)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-950)]"
          >
            View all {MAP_AREAS.length} maps
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-[12.5px] text-[color:var(--gp-muted)]">
            Sectors, licensed colonies, industrial estates and the city master plan.
          </p>
        </div>
      </GpContainer>
    </GpSection>
  );
}
