import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { properties } from "@/lib/db/schema";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import PropertyCardV2 from "./PropertyCardV2";

type Property = typeof properties.$inferSelect;

export default function NewLaunchesV2({
  properties,
  imageMap,
  p,
}: {
  properties: Property[];
  imageMap: Record<string, { path: string; alt?: string } | undefined>;
  p: (path: string) => string;
}) {
  if (properties.length === 0) return null;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow>Fresh Inventory</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">Explore New Launches</h2>
          </div>
          <Link
            href={p("/properties?status=new_launch")}
            className="inline-flex min-h-[38px] items-center gap-1.5 text-[13px] font-semibold text-[color:var(--gp-forest-900)] hover:text-[color:var(--gp-gold-600)]"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="gp-mobile-carousel mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {properties.slice(0, 4).map((property) => (
            <PropertyCardV2
              key={property.id}
              property={property}
              href={p(`/properties/${property.slug}`)}
              imagePath={imageMap[property.id]?.path}
              imageAlt={imageMap[property.id]?.alt}
              size="default"
            />
          ))}
        </div>
      </GpContainer>
    </GpSection>
  );
}
