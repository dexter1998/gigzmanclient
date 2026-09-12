import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  ACRE_SQFT,
  BELT_STATS,
  VILLAGES,
  acres,
  crore,
  farmSearchEnabled,
  perSqft,
  villageBySlug,
} from "@/lib/premium-v2/farm-search";
import PremiumV2EnquiryForm from "@/components/realestate/premium-v2/PremiumV2EnquiryForm";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const HERO = "/verticals/realestate/templates/premium-v2/images/due-diligence.webp";

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    farmSearchEnabled(tenant.slug) ? VILLAGES.map((village) => ({ slug: village.slug })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const village = villageBySlug(slug);
  if (!village) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Land rates in ${village.name} — asking price vs circle rate | ${settings?.firmName ?? ""}`,
    description: `What land in ${village.name} asks (${perSqft(village.medianPerSqft)} median) against what the government values it at, and what that gap costs you in stamp duty and registry.`,
    alternates: { canonical: joinPath(basePathFor(tenant), `/land-rates/${slug}`) },
  };
}

export default async function LandRatePage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const village = villageBySlug(slug);
  if (!village) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const perAcre = village.medianPerSqft ? village.medianPerSqft * ACRE_SQFT : null;
  const beltPerAcre = BELT_STATS.medianPerSqft ? BELT_STATS.medianPerSqft * ACRE_SQFT : null;

  const faqs = [
    {
      q: `What is the land rate in ${village.name}?`,
      a: `Current listings ask a median of ${perSqft(village.medianPerSqft)}, which works out at roughly ${crore(perAcre)} an acre. The belt as a whole medians ${perSqft(BELT_STATS.medianPerSqft)}. These are asking prices from listing data, not transacted rates and not a valuation.`,
    },
    {
      q: `What is the circle rate in ${village.name}?`,
      a: "Circle rates — collector rates — are notified per village and per land class by the Deputy Commissioner, and revised most years. We do not publish a figure here because a stale circle rate is worse than none: it is the number your stamp duty is calculated on. Ask us for the current notified rate on your khasra, or check the Haryana jamabandi portal.",
    },
    {
      q: "Why does the gap matter?",
      a: "Stamp duty and registry are charged on the higher of the circle rate and the declared consideration. Where the market runs well above the circle rate, your registry cost is lower than the purchase suggests — and where it runs below, you pay duty on a value you did not pay.",
    },
    {
      q: "What is stamp duty on agricultural land in Haryana?",
      a: "It varies by the buyer and by whether the land is inside or outside municipal limits, and it changes. We give you the exact figure for your transaction before you commit, rather than a number from a page that may be a year old.",
    },
  ];

  const nearby = VILLAGES.filter((v) => v.slug !== village.slug).slice(0, 12);

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Land rates", url: p("/land-rates") },
            { name: village.name, url: p(`/land-rates/${slug}`) },
          ]),
        )}
      />
      <script {...jsonLdProps(buildFaqJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a }))))} />

      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={HERO} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-14 pt-12 lg:pb-16 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/land-rates")} className="hover:text-[color:var(--gp-gold-300)]">
              Land rates
            </Link>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">
            {village.name} · Sohna belt
          </GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">
            Land rates in {village.name}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            What the market asks, and what the government values it at. The second number is the one
            your stamp duty and registry are calculated on, and the gap between them is the most
            useful figure in a land purchase.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4">
            {[
              { label: "Median asking rate", value: perSqft(village.medianPerSqft) },
              { label: "Per acre", value: crore(perAcre) },
              { label: "Median plot", value: acres(village.medianArea) },
              { label: "Listings", value: String(village.listings) },
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
              <GpEyebrow>Asking rates</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                What {village.name} asks
              </h2>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Across the {village.listings}{" "}
                {village.listings === 1 ? "listing" : "listings"} we track in {village.name},
                asking prices run {crore(village.minPrice)} to {crore(village.maxPrice)}, median{" "}
                {crore(village.medianPrice)} on a median plot of {acres(village.medianArea)}. That
                is {perSqft(village.medianPerSqft)}, or about {crore(perAcre)} an acre.
              </p>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                The belt as a whole medians {perSqft(BELT_STATS.medianPerSqft)} —{" "}
                {crore(beltPerAcre)} an acre — so {village.name} sits{" "}
                {(village.medianPerSqft ?? 0) >= (BELT_STATS.medianPerSqft ?? 0)
                  ? "at or above"
                  : "below"}{" "}
                the belt average. Cheaper per square foot is not automatically better value on farm
                land: the approach road, the land classification and how many co-sharers are on the
                record move the real cost far more than the headline rate does.
              </p>

              <GpEyebrow className="mt-11 block">Circle rate</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                What the government values it at
              </h2>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Circle rates — also called collector rates — are notified per village and per land
                class by the Deputy Commissioner, and revised most years. Stamp duty and registry are
                charged on the higher of the circle rate and the declared consideration, so it is
                the number that decides what registration actually costs you.
              </p>
              <div className="mt-5 rounded-[var(--gp-radius-md)] border-l-[3px] border-[color:var(--gp-gold-600)] bg-white p-5">
                <p className="font-display text-[16px] text-[color:var(--gp-ink)]">
                  We do not publish a circle-rate figure on this page, deliberately
                </p>
                <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                  A stale circle rate is worse than none — it is the number your duty is calculated
                  on, it changes by notification, and it differs by land class within the same
                  village. Send us the khasra number and we will read the current notified rate
                  against your plot before you commit to anything.
                </p>
                <a
                  href="https://jamabandi.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
                >
                  Haryana jamabandi portal
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>

              <GpEyebrow className="mt-11 block">Before you register</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                What the purchase actually costs
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Stamp duty, charged on the higher of the circle rate and the declared consideration.",
                  "Registration fee, on the same base.",
                  "Mutation (intkaal) after registry — the step that puts your name on the revenue record, and the one people skip.",
                  "Development cost on bare land: boundary, borewell, power connection and an approach a car can use in July.",
                  "Brokerage, where it applies. We tell you ours before you visit anything.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gp-gold-600)]"
                      aria-hidden="true"
                    />
                    <span className="text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
                Asking rates on this page are aggregated from current listings on the belt, not
                transacted rates and not a valuation. Circle rates and duty are matters of current
                notification — confirm both against your own khasra before you rely on them.
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
                  Send us a khasra number
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                  We will read the jamabandi and the current circle rate against it and tell you
                  what the registry will actually cost — before you spend anything.
                </p>
                <div className="mt-5">
                  <PremiumV2EnquiryForm
                    basePath={basePath}
                    context={`Land rates — ${village.name}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>Across the belt</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Rates in other pockets
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {nearby.map((other) => (
              <Link
                key={other.slug}
                href={p(`/land-rates/${other.slug}`)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                {other.name}
                <span className="text-[11px] text-[color:var(--gp-muted)]">
                  {perSqft(other.medianPerSqft)}
                </span>
              </Link>
            ))}
            <Link
              href={p(`/farmhouse/in-${village.slug}`)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-900)] px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              Farmhouses in {village.name}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
