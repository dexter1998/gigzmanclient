import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import PropertyCard from "@/components/realestate/PropertyCard";
import PropertyFilters from "@/components/realestate/PropertyFilters";
import SearchBar from "@/components/realestate/SearchBar";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import {
  getFirmSettings,
  getProperties,
  getPropertyImages,
  getPropertyLocalityFacets,
  type PropertyFilters as PropertyFilterInput,
} from "@/lib/content";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdProps } from "@/lib/schema-org";

export async function generateMetadata() {
  const tenant = await getTenant();
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Properties — ${settings?.firmName ?? ""}`,
    description:
      "Browse residential and commercial listings by locality, budget and configuration. Every listing shows its RERA registration status.",
  };
}

export default async function PropertiesPage(props: PageProps<"/site/properties">) {
  const searchParams = await props.searchParams;
  const filters: PropertyFilterInput = {
    propertyType: typeof searchParams.type === "string" ? searchParams.type : undefined,
    purpose: searchParams.purpose === "buy" || searchParams.purpose === "rent" ? searchParams.purpose : undefined,
    locality: typeof searchParams.locality === "string" ? searchParams.locality : undefined,
    minBeds: typeof searchParams.beds === "string" ? Number(searchParams.beds) || undefined : undefined,
    search: typeof searchParams.search === "string" ? searchParams.search : undefined,
  };

  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [listings, localityFacets] = await Promise.all([
    getProperties(tenant.id, filters),
    getPropertyLocalityFacets(tenant.id),
  ]);

  const primaryImages = await Promise.all(
    listings.map(async (property) => {
      const images = await getPropertyImages(property.id);
      return images.find((img) => img.isPrimary) ?? images[0] ?? null;
    }),
  );

  const itemListJsonLd = buildItemListJsonLd(
    listings.map((property, i) => ({
      name: property.title,
      url: p(`/properties/${property.slug}`),
      image: primaryImages[i]?.path ?? null,
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
      {listings.length > 0 ? <script {...jsonLdProps(itemListJsonLd)} /> : null}

      <Section tone="tint" size="md">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
          <a href={p("/")} className="inline-block py-1 hover:text-navy">
            Home
          </a>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">Properties</span>
        </nav>

        <SectionHeader
          eyebrow="Inventory"
          title="Properties matched to your requirement."
          description="Filter by purpose, type, locality and configuration. Carpet area, price and possession timeline are confirmed by the developer before booking."
        />

        <div className="mt-6 max-w-xl">
          <SearchBar action={p("/properties")} />
        </div>
      </Section>

      <Section tone="page" size="md">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PropertyFilters localities={localityFacets} />
          </aside>

          <div>
            <p className="mb-4 text-[12px] text-ink-subtle">
              {listings.length} {listings.length === 1 ? "property" : "properties"} found
            </p>

            {listings.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-line p-10 text-center">
                <p className="text-[14px] font-medium text-ink">No properties match these filters.</p>
                <p className="mt-1.5 text-[13px] text-ink-muted">
                  Try clearing a filter or searching a different locality.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((property, i) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    href={p(`/properties/${property.slug}`)}
                    imagePath={primaryImages[i]?.path}
                    imageAlt={primaryImages[i]?.alt ?? undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
