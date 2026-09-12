import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  ACRE_SQFT,
  BELT_STATS,
  VILLAGES,
  acres,
  crore,
  farmSearchEnabled,
  perSqft,
} from "@/lib/premium-v2/farm-search";
import { GpContainer, GpEyebrow, GpSection } from "@/components/realestate/premium-v2/gp-primitives";

interface Props {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Land rates across the Sohna belt | ${settings?.firmName ?? ""}`,
    description: `Asking rates per square foot and per acre across ${VILLAGES.length} pockets south of Gurugram, and how they relate to the circle rate your stamp duty is charged on.`,
    alternates: { canonical: joinPath(basePathFor(tenant), "/land-rates") },
  };
}

export default async function LandRatesIndexPage(props: Props) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const ranked = [...VILLAGES].sort((a, b) => (b.medianPerSqft ?? 0) - (a.medianPerSqft ?? 0));

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Land rates", url: p("/land-rates") },
          ]),
        )}
      />

      <GpSection tone="cream">
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-[color:var(--gp-muted)]">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-600)]">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[color:var(--gp-ink)]">Land rates</span>
          </nav>
          <GpEyebrow>Rates across the belt</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-3 max-w-3xl text-[color:var(--gp-ink)]">
            What land asks, pocket by pocket.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
            The belt medians {perSqft(BELT_STATS.medianPerSqft)} — about{" "}
            {crore((BELT_STATS.medianPerSqft ?? 0) * ACRE_SQFT)} an acre — but the spread between
            pockets is wide, and the cheapest is not automatically the best value. Each page below
            also covers the circle rate, which is what your stamp duty and registry are charged on.
          </p>

          <div className="mt-10 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                  <th className="px-4 py-3 font-semibold">Pocket</th>
                  <th className="px-4 py-3 font-semibold">Rate / sq ft</th>
                  <th className="px-4 py-3 font-semibold">Per acre</th>
                  <th className="px-4 py-3 font-semibold">Median plot</th>
                  <th className="px-4 py-3 font-semibold">Listings</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((village) => (
                  <tr key={village.slug} className="border-t border-[color:var(--gp-border)]">
                    <td className="px-4 py-2.5">
                      <Link
                        href={p(`/land-rates/${village.slug}`)}
                        className="font-medium text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                      >
                        {village.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[color:var(--gp-gold-600)]">
                      {perSqft(village.medianPerSqft)}
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                      {crore((village.medianPerSqft ?? 0) * ACRE_SQFT)}
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                      {acres(village.medianArea)}
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{village.listings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
            Asking rates from current listings, not transacted rates and not a valuation. Circle
            rates are matters of current notification — we read the one that applies to your khasra
            rather than publishing a figure that ages.
          </p>
        </GpContainer>
      </GpSection>
    </>
  );
}
