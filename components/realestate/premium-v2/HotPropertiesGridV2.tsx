import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { properties } from "@/lib/db/schema";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import PropertyCardV2 from "./PropertyCardV2";

type Property = typeof properties.$inferSelect;

/**
 * Asymmetric editorial grid (sections-hd/06): a flagship tile spans two
 * columns and both rows, two mid properties stack in the middle column, and
 * a tall commercial/yield tile spans the right column's full height. The
 * spans are set with explicit `lg:col-span-*`/`lg:row-span-*`; below `lg`
 * everything collapses to a single stacked column, each card getting its own
 * aspect ratio (see PropertyCardV2's `lg:aspect-auto` fallback).
 */
export default function HotPropertiesGridV2({
  flagship,
  midProperties,
  tallProperty,
  imageMap,
  p,
}: {
  flagship: Property;
  midProperties: [Property, Property];
  tallProperty: Property;
  imageMap: Record<string, { path: string; alt?: string } | undefined>;
  p: (path: string) => string;
}) {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow>Advisor Shortlist</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              HOT properties worth your attention
            </h2>
          </div>
          <Link
            href={p("/properties?featured=1")}
            className="inline-flex min-h-[38px] items-center gap-1.5 text-[13px] font-semibold text-[color:var(--gp-forest-900)] hover:text-[color:var(--gp-gold-600)]"
          >
            See all advisor picks
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-4 lg:grid-rows-2 lg:gap-6">
          {/* Explicit line placement, not auto-flow: with only spans set, the
              grid's auto-placement algorithm would slot the second mid card
              into the tall column's first row instead of stacking it under
              the first mid card. */}
          <div className="lg:col-start-1 lg:row-start-1 lg:col-span-2 lg:row-span-2">
            <PropertyCardV2
              property={flagship}
              href={p(`/properties/${flagship.slug}`)}
              imagePath={imageMap[flagship.id]?.path}
              imageAlt={imageMap[flagship.id]?.alt}
              size="large"
            />
          </div>

          {midProperties.map((property, index) => (
            <div key={property.id} className={`lg:col-start-3 ${index === 0 ? "lg:row-start-1" : "lg:row-start-2"}`}>
              <PropertyCardV2
                property={property}
                href={p(`/properties/${property.slug}`)}
                imagePath={imageMap[property.id]?.path}
                imageAlt={imageMap[property.id]?.alt}
                size="default"
              />
            </div>
          ))}

          <div className="lg:col-start-4 lg:row-start-1 lg:row-span-2">
            <PropertyCardV2
              property={tallProperty}
              href={p(`/properties/${tallProperty.slug}`)}
              imagePath={imageMap[tallProperty.id]?.path}
              imageAlt={imageMap[tallProperty.id]?.alt}
              size="tall"
            />
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
