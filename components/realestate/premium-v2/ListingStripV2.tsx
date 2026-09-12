import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCardV2 from "./PropertyCardV2";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import { getProperties, getPropertyImagesFor } from "@/lib/content";

/**
 * A row of real listings, dropped into a page that is otherwise editorial.
 *
 * The rental and blog pages exist to answer a question, but the reader who
 * gets an answer is the reader most likely to want to see what is actually
 * available — so each of them carries one of these mid-page rather than
 * ending in a bare call to action.
 *
 * Fetches its own rows rather than taking them as a prop: the pages that use
 * it embed it at two or three different points with different filters, and
 * threading the query through every one of them made the callers longer than
 * this component.
 */
export default async function ListingStripV2({
  clientId,
  basePath,
  eyebrow,
  heading,
  blurb,
  locality,
  limit = 3,
  tone = "cream",
  ctaLabel = "See all farmhouses",
}: {
  clientId: string;
  basePath: string;
  eyebrow: string;
  heading: string;
  blurb?: string;
  /** Narrows to one pocket where the inventory has rows for it. */
  locality?: string;
  limit?: number;
  tone?: "cream" | "forest";
  ctaLabel?: string;
}) {
  const p = (path: string) => `${basePath}${path}`.replace(/\/{2,}/g, "/");

  // Fall back to the whole belt when a pocket has nothing live — an empty row
  // is worse than a nearby one, and every pocket here is inside an hour of
  // every other.
  let rows = await getProperties(clientId, locality ? { locality } : {});
  if (locality && rows.length === 0) rows = await getProperties(clientId, {});
  rows = rows.slice(0, limit);
  if (rows.length === 0) return null;

  const imagesByProperty = await getPropertyImagesFor(rows.map((row) => row.id));

  const onForest = tone === "forest";

  return (
    <GpSection tone={tone}>
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow className={onForest ? "text-[color:var(--gp-gold-300)]" : undefined}>
              {eyebrow}
            </GpEyebrow>
            <h2
              className={`gp-section-title font-display mt-2 ${
                onForest ? "text-white" : "text-[color:var(--gp-ink)]"
              }`}
            >
              {heading}
            </h2>
            {blurb ? (
              <p
                className={`mt-3 max-w-xl text-[14px] leading-relaxed ${
                  onForest ? "text-white/70" : "text-[color:var(--gp-body)]"
                }`}
              >
                {blurb}
              </p>
            ) : null}
          </div>
          <Link
            href={p("/properties")}
            className={`inline-flex items-center gap-1.5 text-[13.5px] font-semibold ${
              onForest
                ? "text-[color:var(--gp-gold-300)] hover:text-white"
                : "text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
            }`}
          >
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="gp-mobile-carousel mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((property) => {
            const images = imagesByProperty[property.id] ?? [];
            const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
            return (
              <PropertyCardV2
                key={property.id}
                property={property}
                href={p(`/properties/${property.slug}`)}
                imagePath={primary?.path}
                imageAlt={primary?.alt ?? undefined}
              />
            );
          })}
        </div>
      </GpContainer>
    </GpSection>
  );
}
