import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyFiltersV2 from "./PropertyFiltersV2";
import MobileFilterDrawerV2 from "./MobileFilterDrawerV2";
import PropertyResultsV2 from "./PropertyResultsV2";
import { GpContainer } from "./gp-primitives";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getProperties, getPropertyImagesFor, getPropertyLocalityFacets } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdProps } from "@/lib/schema-org";

/**
 * Deliberately reads no `searchParams`. Doing so on the server marks the whole
 * route dynamic, which is what left this page — the highest-intent page on the
 * site — rendering on demand while every other page was served from the CDN.
 * The full active inventory is prerendered here and PropertyResultsV2 narrows
 * it in the browser from the same URL params the filters already write.
 */
export default async function PremiumV2PropertiesPage({ tenant }: { tenant: Tenant }) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [settings, allProperties, localityFacets] = await Promise.all([
    getFirmSettings(tenant.id),
    getProperties(tenant.id),
    getPropertyLocalityFacets(tenant.id),
  ]);

  if (!settings) notFound();

  const imagesByProperty = await getPropertyImagesFor(allProperties.map((item) => item.id));
  const imageMap = Object.fromEntries(
    allProperties.map((property) => {
      const images = imagesByProperty[property.id] ?? [];
      const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
      return [property.id, primary ? { path: primary.path, alt: primary.alt } : undefined] as const;
    }),
  );

  // The ItemList now covers the whole inventory rather than one filtered page
  // of it, which is both more useful to a crawler and no longer dependent on
  // request-time state.
  const itemListJsonLd = buildItemListJsonLd(
    allProperties.map((property) => ({
      name: property.title,
      url: p(`/properties/${property.slug}`),
      image: imageMap[property.id]?.path ?? null,
    })),
  );

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Properties", url: p("/properties") },
          ]),
        )}
      />
      {allProperties.length > 0 ? <script {...jsonLdProps(itemListJsonLd)} /> : null}

      <div className="gp-section bg-[color:var(--gp-cream-100)]">
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-[color:var(--gp-muted)]">
            <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span>Properties</span>
          </nav>

          <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">Inventory</p>
          <h1 className="gp-section-title mt-2 text-[color:var(--gp-ink)]">
            Properties matched to your requirement.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
            Filter by purpose, type, locality, budget and configuration. RERA status is shown
            plainly on every listing.
          </p>

          <div className="mt-6">
            <MobileFilterDrawerV2>
              <Suspense fallback={null}>
                <PropertyFiltersV2 localities={localityFacets} />
              </Suspense>
            </MobileFilterDrawerV2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
              <Suspense fallback={null}>
                <PropertyFiltersV2 localities={localityFacets} />
              </Suspense>
            </aside>

            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] animate-pulse rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)]"
                    />
                  ))}
                </div>
              }
            >
              <PropertyResultsV2
                allProperties={allProperties}
                imageMap={imageMap}
                propertiesPath={p("/properties")}
              />
            </Suspense>
          </div>
        </GpContainer>
      </div>
    </>
  );
}
