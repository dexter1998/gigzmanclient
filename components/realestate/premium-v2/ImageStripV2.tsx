"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { joinPath } from "@/lib/paths";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

interface ImageStripV2Props {
  basePath: string;
  /** The client's own corridors, in the order the landing page ranks them. */
  localities: { name: string; slug: string }[];
}

const BASE = "/verticals/realestate/templates/premium-v2/images";
const CARD_WIDTH = 260;

interface StripTile {
  src: string;
  alt: string;
  caption: string;
  href: string;
}

/** Corridor photography, keyed by locality slug. */
const LOCALITY_IMAGE: Record<string, string> = {
  "golf-course-road": "corridor-golf-course-road.png",
  "dwarka-expressway": "corridor-dwarka-expressway.png",
  "new-gurugram": "corridor-new-gurugram.png",
  "sohna-road": "corridor-sohna-road.webp",
  "southern-peripheral-road": "corridor-southern-peripheral-road.png",
};

export default function ImageStripV2({ basePath, localities }: ImageStripV2Props) {
  const p = (path: string) => joinPath(basePath, path);
  const trackRef = useRef<HTMLDivElement>(null);

  // Localities only. Two of these tiles used to be property types — "Villas"
  // and "Commercial", both pointing at a filtered listing — which is a
  // different question from "where do I want to live" and made the row read
  // as a mixed bag. Every tile is now a real place with its own page.
  const tiles: StripTile[] = [
    {
      src: `${BASE}/hero-locality-discovery.png`,
      alt: "Gurugram locality skyline",
      caption: "Explore Localities",
      href: p("/localities"),
    },
    ...localities.slice(0, 5).map((locality) => ({
      src: `${BASE}/${LOCALITY_IMAGE[locality.slug] ?? "corridor-new-gurugram.png"}`,
      alt: `${locality.name}, Gurugram`,
      caption: locality.name,
      href: p(`/localities/${locality.slug}`),
    })),
  ];

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: direction * (CARD_WIDTH + 16), behavior: "smooth" });
    }
  }

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.6fr] lg:items-center">
          <div>
            <GpEyebrow>A City of Distinct Addresses</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Gurugram, seen through its most desirable moments
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[color:var(--gp-body)]">
              From premium corridors to specific property types — start wherever your search
              actually begins.
            </p>

            <Link
              href={p("/localities")}
              className="mt-6 inline-flex min-h-[50px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-forest-900)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              Explore Localities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* min-w-0 overrides the grid item's default min-width:auto — without
              it, this column refuses to shrink below the track's intrinsic
              content width (5 shrink-0 cards), so instead of the track
              scrolling within its allotted column, the whole column (and the
              nav buttons below it) overflowed past the container/viewport. */}
          <div className="relative min-w-0">
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {tiles.map((tile) => (
                <Link
                  key={tile.caption}
                  href={tile.href}
                  style={{ width: CARD_WIDTH, scrollSnapAlign: "start" }}
                  className="group relative block aspect-[3/4] shrink-0 overflow-hidden rounded-[var(--gp-radius-md)]"
                >
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    sizes="260px"
                    className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
                  <p className="gp-overlay-title font-display absolute bottom-4 left-4 right-4 text-white">
                    {tile.caption}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-forest-900)] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-forest-900)] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
