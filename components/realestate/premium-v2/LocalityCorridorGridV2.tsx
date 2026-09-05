import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { localities } from "@/lib/db/schema";
import { formatIndianPrice } from "@/lib/format";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

type Locality = typeof localities.$inferSelect;

/**
 * Same card visual as the homepage's CorridorPanoramaV2 (image, eyebrow name,
 * price/YoY line, gold accent) but a fresh component: this page always shows
 * all five localities as a static row, not a CTA-flanked carousel of a
 * homepage subset, so the layout and prop shape differ enough to not share
 * the file.
 */
export default function LocalityCorridorGridV2({
  localities,
  p,
}: {
  localities: Locality[];
  p: (path: string) => string;
}) {
  if (localities.length === 0) return null;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Start With a Corridor</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 max-w-xl text-[color:var(--gp-ink)]">
          Five different Gurugram stories
        </h2>
        <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[color:var(--gp-body)]">
          Each corridor has its own pace of growth, its own buyer profile and its own price curve.
          Pick the one that matches how you want to live or invest.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {localities.map((locality, index) => (
            <Link
              key={locality.id}
              href={p(`/localities/${locality.slug}`)}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--gp-radius-md)]"
            >
              {locality.heroImage ? (
                <Image
                  src={locality.heroImage}
                  alt={locality.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                  priority={index === 0}
                />
              ) : (
                <div className="absolute inset-0 bg-[color:var(--gp-forest-800)]" />
              )}
              <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{locality.name}</p>
                {locality.avgPricePerSqft ? (
                  <p className="font-sans mt-1 text-[19px] font-semibold leading-none text-white">
                    {formatIndianPrice(locality.avgPricePerSqft)}/sq.ft
                  </p>
                ) : null}
                <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-white/85">
                  {locality.yoyChangePercent != null ? `${locality.yoyChangePercent}% YoY · ` : null}
                  View corridor
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </GpContainer>
    </GpSection>
  );
}
