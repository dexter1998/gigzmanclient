import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings, getProperties, getPropertyImagesFor } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  BHKS,
  BUDGETS,
  FACINGS,
  FEATURES,
  SIZES,
  VILLAGES,
  acres,
  allFarmSlugs,
  crore,
  facetableFor,
  farmSearchEnabled,
  indexable,
  perSqft,
  resolveFarmSlug,
  statsFor,
  type FarmPage,
} from "@/lib/premium-v2/farm-search";
import { copyFor } from "@/lib/premium-v2/farm-search-copy";
import { pocketsNear } from "@/lib/premium-v2/farm-geo";
import PropertyCardV2 from "@/components/realestate/premium-v2/PropertyCardV2";
import PremiumV2EnquiryForm from "@/components/realestate/premium-v2/PremiumV2EnquiryForm";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

/** Deterministic photograph per slug, so a page keeps the same picture. */
function heroFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return `${FARM}/${String((hash % 30) + 1).padStart(2, "0")}-gurgaon-farmhouse.webp`;
}

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    farmSearchEnabled(tenant.slug) ? allFarmSlugs().map((slug) => ({ slug })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const page = resolveFarmSlug(slug);
  if (!page) return {};
  const settings = await getFirmSettings(tenant.id);
  const copy = copyFor(page);
  return {
    title: `${copy.title} | ${settings?.firmName ?? ""}`,
    description: copy.description,
    alternates: { canonical: joinPath(basePathFor(tenant), `/farmhouse/${slug}`) },
    // The quality gate. A combination with nothing to say is still reachable
    // and still passes link equity — it is simply not offered to the index.
    robots: indexable(page) ? undefined : { index: false, follow: true },
  };
}

/** Which listings this page should show, narrowed as far as the data allows. */
async function listingsFor(page: FarmPage, clientId: string) {
  // A road or an adjacent geo has no listings of its own — it draws on the
  // pockets behind it, so the row query follows those.
  const geo = "geo" in page ? page.geo : undefined;
  const localities = geo
    ? geo.kind === "village"
      ? [geo.name]
      : geo.sources.map((v) => v.name)
    : [];
  let rows = localities.length
    ? (await Promise.all(localities.map((name) => getProperties(clientId, { locality: name })))).flat()
    : await getProperties(clientId, {});

  if (page.kind === "size") {
    const narrowed = rows.filter((row) => {
      const area = Number(row.area);
      return area >= page.size.min && area <= page.size.max;
    });
    if (narrowed.length) rows = narrowed;
  }
  if (page.kind === "budget") {
    const narrowed = rows.filter((row) => {
      const price = Number(row.price);
      return price >= page.budget.min && price <= page.budget.max;
    });
    if (narrowed.length) rows = narrowed;
  }
  if (page.kind === "bhk") {
    const narrowed = rows.filter((row) => row.beds === page.bhk);
    if (narrowed.length) rows = narrowed;
  }
  if (page.kind === "compare") {
    const [a, b] = await Promise.all([
      getProperties(clientId, { locality: page.a.name }),
      getProperties(clientId, { locality: page.b.name }),
    ]);
    rows = [...a.slice(0, 3), ...b.slice(0, 3)];
  }

  // Never render an empty row — fall back to the belt rather than a gap.
  if (rows.length === 0) rows = await getProperties(clientId, {});
  return rows.slice(0, 6);
}

export default async function FarmSearchPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const page = resolveFarmSlug(slug);
  if (!page) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const copy = copyFor(page);

  const rows = await listingsFor(page, tenant.id);
  const imagesByProperty = await getPropertyImagesFor(rows.map((row) => row.id));

  const geo = "geo" in page ? page.geo : undefined;
  const stats = statsFor(page);
  const hero = heroFor(slug);

  // Internal linking is not decoration on a family this size — it is the only
  // way a crawler reaches the tail. Each page links sideways along its own
  // axis and upward to its geo.
  const sideways: { label: string; href: string }[] = (() => {
    const suffix = geo ? `-in-${geo.slug}` : "";
    const allowed = geo ? facetableFor(geo) : { sizes: true, budgets: true, bhk: true, facings: true, features: true };
    switch (page.kind) {
      case "size":
        return SIZES.filter((s) => s.slug !== page.size.slug).map((s) => ({
          label: s.label,
          href: p(`/farmhouse/${s.slug}${page.land ? "-farm-land" : ""}${suffix}`),
        }));
      case "budget":
        return BUDGETS.filter((b) => b.slug !== page.budget.slug).map((b) => ({
          label: b.label,
          href: p(`/farmhouse/${b.slug}${page.land ? "-farm-land" : ""}${suffix}`),
        }));
      case "bhk":
        return BHKS.filter((n) => n !== page.bhk).map((n) => ({
          label: `${n} BHK`,
          href: p(`/farmhouse/${n}-bhk${suffix}`),
        }));
      case "facing":
        return FACINGS.filter((f) => f.slug !== page.facing.slug).map((f) => ({
          label: `${f.label} facing`,
          href: p(`/farmhouse/${f.slug}-facing${suffix}`),
        }));
      case "feature":
        return FEATURES.filter((f) => f.slug !== page.feature.slug).map((f) => ({
          label: f.label.replace(/^(with |that are |on |in )/, ""),
          href: p(`/farmhouse/${f.slug}${suffix}`),
        }));
      case "luxury":
      case "owner":
        return geo
          ? [
              { label: `All farmhouses in ${geo.name}`, href: p(`/farmhouse/in-${geo.slug}`) },
              { label: `Farm land in ${geo.name}`, href: p(`/farmhouse/farm-land-in-${geo.slug}`) },
            ]
          : [];
      case "geo":
        return [
          ...(allowed.sizes
            ? SIZES.slice(0, 5).map((size) => ({
                label: `${size.label} in ${page.geo.name}`,
                href: p(`/farmhouse/${size.slug}-in-${page.geo.slug}`),
              }))
            : []),
          ...(allowed.budgets
            ? BUDGETS.slice(0, 4).map((budget) => ({
                label: `${budget.label} in ${page.geo.name}`,
                href: p(`/farmhouse/${budget.slug}-in-${page.geo.slug}`),
              }))
            : []),
          ...(page.geo.kind !== "adjacent"
            ? [
                { label: `Luxury in ${page.geo.name}`, href: p(`/farmhouse/luxury-in-${page.geo.slug}`) },
                {
                  label: `Owner-direct in ${page.geo.name}`,
                  href: p(`/farmhouse/owner-direct-in-${page.geo.slug}`),
                },
              ]
            : []),
        ];
      case "compare":
        return [page.a, page.b].map((v) => ({
          label: `Farmhouses in ${v.name}`,
          href: p(`/farmhouse/in-${v.slug}`),
        }));
      case "landmark":
        // A landmark's sideways links are the pockets around it, which is the
        // only navigation that makes sense from a place you cannot buy in.
        return pocketsNear(page.landmark.lat, page.landmark.lng, 6).map(({ village, km }) => ({
          label: `${village.name} · ${km} km`,
          href: p(`/farmhouse/in-${village.slug}`),
        }));
    }
  })();

  const nearbyVillages = VILLAGES.filter((v) => v.slug !== geo?.slug).slice(0, 10);

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Farmhouses", url: p("/farmhouse") },
            { name: copy.h1, url: p(`/farmhouse/${slug}`) },
          ]),
        )}
      />
      <script
        {...jsonLdProps(buildFaqJsonLd(copy.faqs.map((f) => ({ question: f.q, answer: f.a }))))}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-14 pt-12 lg:pb-16 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/farmhouse")} className="hover:text-[color:var(--gp-gold-300)]">
              Farmhouses
            </Link>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">{copy.eyebrow}</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">{copy.h1}</h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            {copy.intro}
          </p>

          {/* Skipped on a comparison, where a single set of figures would read
              as though it described both pockets — the side-by-side table
              below is that page's data. */}
          {page.kind === "compare" ? null : (
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4">
            {[
              {
                label: geo ? `Listings in ${geo.name}` : "Listings on the belt",
                value: String(stats.listings),
              },
              { label: "Median asking", value: crore(stats.medianPrice) },
              { label: "Median plot", value: acres(stats.medianArea) },
              { label: "Median rate", value: perSqft(stats.medianPerSqft) },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11.5px] uppercase tracking-[0.09em] text-white/55">
                  {stat.label}
                </dt>
                <dd className="font-sans mt-1 text-[22px] font-semibold leading-none text-[color:var(--gp-gold-300)]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          )}
        </div>
      </section>

      {/* ── Body + enquiry ───────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <div>
              <GpEyebrow>{copy.dataHeading}</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 max-w-2xl text-[color:var(--gp-ink)]">
                {page.kind === "compare"
                  ? "The numbers, side by side"
                  : "What the listings actually show"}
              </h2>
              {copy.body.map((para) => (
                <p
                  key={para.slice(0, 40)}
                  className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]"
                >
                  {para}
                </p>
              ))}

              {page.kind === "compare" ? (
                <div className="mt-8 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
                  <table className="w-full min-w-[520px] text-[14px]">
                    <thead>
                      <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                        <th className="px-4 py-3 font-semibold">Measure</th>
                        <th className="px-4 py-3 font-semibold">{page.a.name}</th>
                        <th className="px-4 py-3 font-semibold">{page.b.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Listings", String(page.a.listings), String(page.b.listings)],
                        ["Median asking", crore(page.a.medianPrice), crore(page.b.medianPrice)],
                        ["Lowest asking", crore(page.a.minPrice), crore(page.b.minPrice)],
                        ["Highest asking", crore(page.a.maxPrice), crore(page.b.maxPrice)],
                        ["Median plot", acres(page.a.medianArea), acres(page.b.medianArea)],
                        ["Median rate", perSqft(page.a.medianPerSqft), perSqft(page.b.medianPerSqft)],
                        ["Gated", `${page.a.gated}`, `${page.b.gated}`],
                        ["Ready to move", `${page.a.readyToMove}`, `${page.b.readyToMove}`],
                      ].map(([label, a, b]) => (
                        <tr key={label} className="border-t border-[color:var(--gp-border)]">
                          <td className="px-4 py-2.5 text-[color:var(--gp-muted)]">{label}</td>
                          <td className="px-4 py-2.5 font-medium text-[color:var(--gp-ink)]">{a}</td>
                          <td className="px-4 py-2.5 font-medium text-[color:var(--gp-ink)]">{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <p className="mt-5 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
                Every figure on this page is aggregated from asking prices on current listings in the
                belt. They are not transacted rates, not a valuation, and not a quote.
              </p>

              {/* ── FAQ ────────────────────────────────────────────── */}
              <div className="mt-11 border-t border-[color:var(--gp-border)] pt-8">
                <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                  Questions we get asked
                </h2>
                <dl className="mt-5 space-y-5">
                  {copy.faqs.map((faq) => (
                    <div key={faq.q}>
                      <dt className="text-[15px] font-semibold text-[color:var(--gp-ink)]">
                        {faq.q}
                      </dt>
                      <dd className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                        {faq.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] p-6">
                <h2 className="font-display text-[19px] text-[color:var(--gp-ink)]">
                  Ask us what is actually available
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                  Listings move faster than any page. Tell us the size and the budget and we will
                  come back with what is live this week — including plots that never reach a portal.
                </p>
                <div className="mt-5">
                  <PremiumV2EnquiryForm basePath={basePath} context={copy.h1} />
                </div>
              </div>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* ── Listings ─────────────────────────────────────────────────── */}
      {rows.length > 0 ? (
        <GpSection tone="forest">
          <GpContainer>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                  {geo ? geo.name : "The belt"}
                </GpEyebrow>
                <h2 className="gp-section-title font-display mt-2 text-white">
                  Currently listed with us
                </h2>
              </div>
              <Link
                href={p("/properties")}
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-300)] hover:text-white"
              >
                All farmhouses
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
      ) : null}

      {/* ── Internal linking ─────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {sideways.length > 0 ? (
              <div>
                <GpEyebrow>Same search, different filter</GpEyebrow>
                <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                  Narrow it another way
                </h2>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {sideways.slice(0, 12).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex min-h-[40px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <GpEyebrow>Other pockets</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                Elsewhere on the belt
              </h2>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {nearbyVillages.map((other) => (
                  <Link
                    key={other.slug}
                    href={p(`/farmhouse/in-${other.slug}`)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                  >
                    {other.name}
                    <span className="text-[11px] text-[color:var(--gp-muted)]">
                      {other.listings}
                    </span>
                  </Link>
                ))}
                <Link
                  href={p("/farmhouse")}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-900)] px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
                >
                  All pockets
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              {geo ? (
                <div className="mt-8 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5">
                  <p className="font-display text-[16px] text-[color:var(--gp-ink)]">
                    Land rates and circle rate in {geo.name}
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
                    What the market asks against what the government values it at — which is what
                    your stamp duty is actually calculated on.
                  </p>
                  <Link
                    href={p(`/land-rates/${geo.slug}`)}
                    className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
                  >
                    See {geo.name} land rates
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
