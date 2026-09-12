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
  BELT_STATS,
  ESTATES,
  VILLAGES,
  acres,
  crore,
  estateBySlug,
  farmSearchEnabled,
  perSqft,
} from "@/lib/premium-v2/farm-search";
import PropertyCardV2 from "@/components/realestate/premium-v2/PropertyCardV2";
import PremiumV2EnquiryForm from "@/components/realestate/premium-v2/PremiumV2EnquiryForm";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

function heroFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 37 + slug.charCodeAt(i)) >>> 0;
  return `${FARM}/${String((hash % 30) + 1).padStart(2, "0")}-gurgaon-farmhouse.webp`;
}

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    farmSearchEnabled(tenant.slug) ? ESTATES.map((estate) => ({ slug: estate.slug })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const estate = estateBySlug(slug);
  if (!estate) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `${estate.name} — farmhouses & plots for sale | ${settings?.firmName ?? ""}`,
    description: `${estate.name}: ${estate.listings} listings, median asking ${crore(estate.medianPrice)} on ${acres(estate.medianArea)}, about ${perSqft(estate.medianPerSqft)}. What the estate is like and what to check inside it.`,
    alternates: { canonical: joinPath(basePathFor(tenant), `/estates/${slug}`) },
    // Estates with a single listing cannot say much beyond that one row.
    robots: estate.listings >= 2 ? undefined : { index: false, follow: true },
  };
}

export default async function EstatePage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const estate = estateBySlug(slug);
  if (!estate) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const village = estate.villages[0]?.[0];
  let rows = await getProperties(tenant.id, village ? { locality: village } : {});
  if (rows.length === 0) rows = await getProperties(tenant.id, {});
  rows = rows.slice(0, 6);
  const imagesByProperty = await getPropertyImagesFor(rows.map((row) => row.id));

  const share = BELT_STATS.listings
    ? Math.round((estate.listings / BELT_STATS.listings) * 100)
    : 0;

  const faqs = [
    {
      q: `What does a plot in ${estate.name} cost?`,
      a: `Asking prices on the ${estate.listings} ${estate.listings === 1 ? "listing" : "listings"} we track here run ${crore(estate.minPrice)} to ${crore(estate.maxPrice)}, median ${crore(estate.medianPrice)} — about ${perSqft(estate.medianPerSqft)}. These are asking prices from listing data, not transacted rates.`,
    },
    {
      q: "What plot sizes are there?",
      a: `The median plot here is ${acres(estate.medianArea)}. ${estate.bedrooms.length ? `By configuration the listings run ${estate.bedrooms.slice(0, 4).map(([v, n]) => `${n} × ${v} BHK`).join(", ")}.` : ""}`,
    },
    {
      q: "Is it gated?",
      a: `${estate.gated} of ${estate.listings} listings here describe a gated approach. On land you visit at weekends, a manned gate and a maintained internal road matter more than most things inside the boundary wall.`,
    },
    {
      q: "Is the title clean?",
      a: estate.ownership.length
        ? `Listings here state ${estate.ownership.map(([k, n]) => `${n} ${k.toLowerCase()}`).join(", ")}. We read the jamabandi at the Tehsil on any plot before recommending it — a power of attorney is not ownership.`
        : "We read the jamabandi at the Tehsil on any plot before recommending it. Ownership type stated on a listing is not a substitute for the record.",
    },
  ];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Estates", url: p("/estates") },
            { name: estate.name, url: p(`/estates/${slug}`) },
          ]),
        )}
      />
      <script {...jsonLdProps(buildFaqJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a }))))} />

      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={heroFor(slug)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-14 pt-12 lg:pb-16 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/estates")} className="hover:text-[color:var(--gp-gold-300)]">
              Estates
            </Link>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">
            {village ? `${village} · Sohna belt` : "Sohna belt"}
          </GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">
            Farmhouses and plots in {estate.name}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            {share >= 10
              ? `${estate.name} accounts for ${share}% of everything currently listed on the belt — ${estate.listings} of ${BELT_STATS.listings} properties. When people say "the Sohna farmhouse market", a large part of what they mean is this estate.`
              : `${estate.listings} ${estate.listings === 1 ? "property" : "properties"} currently listed inside ${estate.name}, out of ${BELT_STATS.listings} across the belt.`}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4">
            {[
              { label: "Listings", value: String(estate.listings) },
              { label: "Median asking", value: crore(estate.medianPrice) },
              { label: "Median plot", value: acres(estate.medianArea) },
              { label: "Median rate", value: perSqft(estate.medianPerSqft) },
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
        </div>
      </section>

      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <div>
              <GpEyebrow>Inside the estate</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                What the listings show
              </h2>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Asking prices in {estate.name} run {crore(estate.minPrice)} to{" "}
                {crore(estate.maxPrice)}, median {crore(estate.medianPrice)} on a median plot of{" "}
                {acres(estate.medianArea)} — about {perSqft(estate.medianPerSqft)}. The belt as a
                whole medians {perSqft(BELT_STATS.medianPerSqft)}.
              </p>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Of these, {estate.gated} describe a gated approach, {estate.pool} a pool,{" "}
                {estate.park} park facing and {estate.corner} a corner plot;{" "}
                {estate.readyToMove} are described as ready to move. Those are the sellers&rsquo;
                descriptions — we confirm them on the visit and photograph what we find.
              </p>
              {estate.villages.length > 0 ? (
                <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                  The estate sits in{" "}
                  {estate.villages.map(([name]) => name).filter(Boolean).join(" and ")}. The village
                  matters on a land purchase: revenue records, co-sharers and the recorded approach
                  road are all village-level facts, and we read them there rather than from the file
                  a seller hands over.
                </p>
              ) : null}
              <p className="mt-5 text-[12px] text-[color:var(--gp-muted)]">
                Figures are aggregated from asking prices on current listings, not transacted rates.
              </p>

              <div className="mt-11 border-t border-[color:var(--gp-border)] pt-8">
                <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                  Questions we get asked
                </h2>
                <dl className="mt-5 space-y-5">
                  {faqs.map((faq) => (
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
                  Ask about {estate.name}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                  We work this estate directly. Tell us the size and budget and we will say what is
                  live inside it this week — including plots that never reach a portal.
                </p>
                <div className="mt-5">
                  <PremiumV2EnquiryForm basePath={basePath} context={estate.name} />
                </div>
              </div>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {rows.length > 0 ? (
        <GpSection tone="forest">
          <GpContainer>
            <GpEyebrow className="text-[color:var(--gp-gold-300)]">
              {village ?? "The belt"}
            </GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-white">Currently listed</h2>
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

      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>Nearby</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Other estates and pockets
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {ESTATES.filter((e) => e.slug !== estate.slug && e.listings >= 2).map((other) => (
              <Link
                key={other.slug}
                href={p(`/estates/${other.slug}`)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                {other.name}
                <span className="text-[11px] text-[color:var(--gp-muted)]">{other.listings}</span>
              </Link>
            ))}
            {VILLAGES.slice(0, 6).map((v) => (
              <Link
                key={v.slug}
                href={p(`/farmhouse/in-${v.slug}`)}
                className="inline-flex min-h-[40px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                Farmhouses in {v.name}
              </Link>
            ))}
            <Link
              href={p("/estates")}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-900)] px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              All estates
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
