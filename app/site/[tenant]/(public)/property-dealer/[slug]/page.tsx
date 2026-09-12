import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  acres,
  allGeos,
  crore,
  estatesOf,
  farmSearchEnabled,
  geoBySlug,
  perSqft,
} from "@/lib/premium-v2/farm-search";
import { advisorRosterFor } from "@/lib/premium-v2/advisors";
import PremiumV2EnquiryForm from "@/components/realestate/premium-v2/PremiumV2EnquiryForm";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const HERO = "/verticals/realestate/templates/premium-v2/farmhouses/11-gurgaon-farmhouse.webp";

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    farmSearchEnabled(tenant.slug) ? allGeos().map((geo) => ({ slug: geo.slug })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const geo = geoBySlug(slug);
  if (!geo) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Property dealer in ${geo.name} — farmhouses & farm land | ${settings?.firmName ?? ""}`,
    description: `${settings?.firmName ?? "We"} deal in farmhouses and farm land in ${geo.name}. What the pocket asks, what we check before recommending a plot, and who you actually speak to.`,
    alternates: { canonical: joinPath(basePathFor(tenant), `/property-dealer/${slug}`) },
  };
}

/**
 * "Property dealer in {place}" is one of the strongest local queries in this
 * market, and the only page on the site where the client is the subject rather
 * than the inventory. It answers the question a person asking it actually has:
 * who are you, do you work here, and what do you know about this pocket.
 */
export default async function PropertyDealerPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const geo = geoBySlug(slug);
  if (!geo) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const s = geo.stats;
  const roster = advisorRosterFor(tenant.slug);
  const estates = estatesOf(geo).slice(0, 3);

  const faqs = [
    {
      q: `Do you deal in ${geo.name}?`,
      a: `Yes. We track ${s.listings} ${s.listings === 1 ? "listing" : "listings"} ${geo.kind === "village" ? `in ${geo.name}` : `across the pockets ${geo.name} covers`}, median asking ${crore(s.medianPrice)} on ${acres(s.medianArea)}. Asking prices from listing data, not transacted rates.`,
    },
    {
      q: "What do you charge?",
      a: "We tell you the fee before you visit anything, and it does not change afterwards. If you only want a khasra number read against the record, ask — that costs you nothing.",
    },
    {
      q: "What do you check before recommending a plot?",
      a: "Jamabandi and the ownership chain at the Tehsil, mutation status and every co-sharer's consent, land classification, the recorded approach road, boundary against the measured area, and any litigation or acquisition notice on the khasra.",
    },
    {
      q: "Who will I actually speak to?",
      a: `One of us — ${roster.members.map((m) => m.name.split(" ")[0]).join(", ")}. Whoever you call is an owner of the firm, not a call centre, and the same person stays with you to registry.`,
    },
  ];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Farmhouses", url: p("/farmhouse") },
            { name: `Property dealer in ${geo.name}`, url: p(`/property-dealer/${slug}`) },
          ]),
        )}
      />
      <script {...jsonLdProps(buildFaqJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a }))))} />

      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={HERO} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-14 pt-12 lg:pb-16 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/farmhouse")} className="hover:text-[color:var(--gp-gold-300)]">Farmhouses</Link>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">{geo.name} · Sohna belt</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">
            Property dealer in {geo.name}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            {settings.firmName} works one belt and one asset: farmhouses and farm land south of
            Gurugram. Our office is at The Westin Sohna Resort &amp; Spa in Karnki, and the family
            that runs it is from the village.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4">
            {[
              { label: `Listings tracked`, value: String(s.listings) },
              { label: "Median asking", value: crore(s.medianPrice) },
              { label: "Median plot", value: acres(s.medianArea) },
              { label: "Median rate", value: perSqft(s.medianPerSqft) },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11.5px] uppercase tracking-[0.09em] text-white/55">{stat.label}</dt>
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
              <GpEyebrow>What we know about {geo.name}</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                A dealer who works one belt
              </h2>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                {geo.kind === "village"
                  ? `${geo.name} carries ${s.listings} ${s.listings === 1 ? "listing" : "listings"} in our data, asking ${crore(s.minPrice)} to ${crore(s.maxPrice)}, median ${crore(s.medianPrice)} on ${acres(s.medianArea)} — about ${perSqft(s.medianPerSqft)}.`
                  : `${geo.name} has no listings filed against it directly. These figures are the pockets it runs through — ${geo.sources.map((v) => `${v.name} (${v.listings})`).join(", ")} — asking ${crore(s.minPrice)} to ${crore(s.maxPrice)}, median ${crore(s.medianPrice)}.`}
              </p>
              {estates.length ? (
                <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                  Most of what trades here sits inside {estates.map(([name, n]) => `${name} (${n})`).join(", ")}. On land you visit at weekends, the estate&rsquo;s approach road and upkeep matter as much as anything inside the boundary wall.
                </p>
              ) : null}
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                What separates a dealer who works this belt from one who lists it: land here changes
                hands on revenue records, mutations and family partitions that never reach a portal.
                When a plot looks cheap there is usually a reason, and the reason is usually in the
                village rather than in the file.
              </p>

              <h2 className="gp-section-title font-display mt-10 text-[color:var(--gp-ink)]">
                Who you speak to
              </h2>
              <ul className="mt-5 space-y-3">
                {roster.members.map((member) => (
                  <li key={member.slug} className="border-t border-[color:var(--gp-border)] pt-3">
                    <p className="font-display text-[15.5px] text-[color:var(--gp-ink)]">
                      {member.name} <span className="text-[13px] text-[color:var(--gp-muted)]">· {member.role}</span>
                    </p>
                    <p className="mt-1 max-w-[58ch] text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
                      {member.specialisation}
                    </p>
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone.replace(/\s/g, "")}`}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        {member.phone}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[12px] text-[color:var(--gp-muted)]">
                Figures are asking prices from current listings on the belt, not transacted rates.
              </p>

              <div className="mt-10 border-t border-[color:var(--gp-border)] pt-8">
                <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">Questions we get asked</h2>
                <dl className="mt-5 space-y-5">
                  {faqs.map((faq) => (
                    <div key={faq.q}>
                      <dt className="text-[15px] font-semibold text-[color:var(--gp-ink)]">{faq.q}</dt>
                      <dd className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[color:var(--gp-body)]">{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] p-6">
                <h2 className="font-display text-[19px] text-[color:var(--gp-ink)]">
                  Tell us what you are looking for in {geo.name}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                  Size, budget and when you want to visit. We come back with what is live this week,
                  including plots that never reach a portal.
                </p>
                <div className="mt-5">
                  <PremiumV2EnquiryForm basePath={basePath} context={`Property dealer — ${geo.name}`} />
                </div>
              </div>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>Elsewhere on the belt</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Other pockets we work
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {allGeos()
              .filter((other) => other.slug !== geo.slug)
              .slice(0, 20)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={p(`/property-dealer/${other.slug}`)}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                >
                  {other.name}
                </Link>
              ))}
            <Link
              href={p(`/farmhouse/in-${geo.slug}`)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-900)] px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              Listings in {geo.name}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
