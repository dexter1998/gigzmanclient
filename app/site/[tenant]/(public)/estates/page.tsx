import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdProps } from "@/lib/schema-org";
import { BELT_STATS, ESTATES, acres, crore, farmSearchEnabled, perSqft } from "@/lib/premium-v2/farm-search";
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
    title: `Farm estates in the Sohna belt | ${settings?.firmName ?? ""}`,
    description: `${ESTATES.length} named farm estates south of Gurugram, with listing counts, median asking prices and plot sizes for each.`,
    alternates: { canonical: joinPath(basePathFor(tenant), "/estates") },
  };
}

export default async function EstatesIndexPage(props: Props) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const named = ESTATES.filter((e) => e.listings >= 2);
  const single = ESTATES.filter((e) => e.listings < 2);

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Estates", url: p("/estates") },
          ]),
        )}
      />
      <script
        {...jsonLdProps(
          buildItemListJsonLd(
            named.map((e) => ({ name: e.name, url: p(`/estates/${e.slug}`) })),
          ),
        )}
      />

      <GpSection tone="cream">
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-[color:var(--gp-muted)]">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-600)]">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[color:var(--gp-ink)]">Estates</span>
          </nav>
          <GpEyebrow>Named estates</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-3 max-w-3xl text-[color:var(--gp-ink)]">
            The farm estates the belt actually trades in.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
            Most of the {BELT_STATS.listings} properties on the belt sit inside a named estate rather
            than on an isolated holding. The estate&rsquo;s own approach road, gate and upkeep matter as
            much as anything inside the boundary wall — so it is worth choosing the estate before the
            plot.
          </p>

          <div className="mt-10 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
            <table className="w-full min-w-[680px] text-[14px]">
              <thead>
                <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                  <th className="px-4 py-3 font-semibold">Estate</th>
                  <th className="px-4 py-3 font-semibold">Pocket</th>
                  <th className="px-4 py-3 font-semibold">Listings</th>
                  <th className="px-4 py-3 font-semibold">Median asking</th>
                  <th className="px-4 py-3 font-semibold">Median plot</th>
                  <th className="px-4 py-3 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {named.map((estate) => (
                  <tr key={estate.slug} className="border-t border-[color:var(--gp-border)]">
                    <td className="px-4 py-2.5">
                      <Link
                        href={p(`/estates/${estate.slug}`)}
                        className="font-medium text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                      >
                        {estate.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                      {estate.villages[0]?.[0] ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{estate.listings}</td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{crore(estate.medianPrice)}</td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{acres(estate.medianArea)}</td>
                    <td className="px-4 py-2.5 font-medium text-[color:var(--gp-gold-600)]">
                      {perSqft(estate.medianPerSqft)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-[13px] font-semibold text-[color:var(--gp-ink)]">
            Estates with a single listing
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {single.map((estate) => (
              <Link
                key={estate.slug}
                href={p(`/estates/${estate.slug}`)}
                className="inline-flex min-h-[38px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-3.5 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                {estate.name}
              </Link>
            ))}
          </div>
          <p className="mt-5 text-[12px] text-[color:var(--gp-muted)]">
            Figures are asking prices from current listings, not transacted rates.
          </p>
        </GpContainer>
      </GpSection>
    </>
  );
}
