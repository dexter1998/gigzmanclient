import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import LocalityCard from "@/components/realestate/LocalityCard";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import { getFirmSettings, getLocalities } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdProps } from "@/lib/schema-org";

export async function generateMetadata() {
  const tenant = await getTenant();
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Localities — ${settings?.firmName ?? ""}`,
    description:
      "Locality-wise market snapshots — average price per sq.ft, year-on-year change and rental yield.",
  };
}

export default async function LocalitiesPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);
  const localities = await getLocalities(tenant.id);

  const itemListJsonLd = buildItemListJsonLd(
    localities.map((locality) => ({
      name: locality.name,
      url: p(`/localities/${locality.slug}`),
      image: locality.heroImage,
    })),
  );

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Localities", url: p("/localities") },
          ]),
        )}
      />
      {localities.length > 0 ? <script {...jsonLdProps(itemListJsonLd)} /> : null}

      <Section tone="tint" size="md">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
          <a href={p("/")} className="inline-block py-1 hover:text-navy">
            Home
          </a>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">Localities</span>
        </nav>

        <SectionHeader
          eyebrow="Market snapshots"
          title="Know the locality before you shortlist a property."
          description="Average price per sq.ft, year-on-year appreciation and rental yield, tracked corridor by corridor."
        />
      </Section>

      <Section tone="page" size="md">
        {localities.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-line p-10 text-center">
            <p className="text-[14px] font-medium text-ink">Locality pages are being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {localities.map((locality) => (
              <LocalityCard
                key={locality.id}
                locality={locality}
                href={p(`/localities/${locality.slug}`)}
              />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
