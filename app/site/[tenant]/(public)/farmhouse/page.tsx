import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  ADJACENT,
  BELT_STATS,
  BHKS,
  BUDGETS,
  ESTATES,
  FACINGS,
  FEATURES,
  LANDMARKS,
  PINCODES,
  ROADS,
  SIZES,
  VILLAGES,
  acres,
  comparablePairs,
  crore,
  farmSearchEnabled,
  perSqft,
} from "@/lib/premium-v2/farm-search";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const HERO = "/verticals/realestate/templates/premium-v2/images/hero-farmhouse-evergreen.webp";

interface Props {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Farmhouses & Farm Land in the Sohna Belt | ${settings?.firmName ?? ""}`,
    description: `${BELT_STATS.listings} farmhouse and farm-land listings across ${VILLAGES.length} pockets south of Gurugram — by village, plot size, budget, configuration and feature, with the asking-price data behind each one.`,
    alternates: { canonical: joinPath(basePathFor(tenant), "/farmhouse") },
  };
}

/** A pill row, used for every axis on this page. */
function Pills({ links }: { links: { label: string; href: string; hint?: string }[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2.5">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
        >
          {link.label}
          {link.hint ? (
            <span className="text-[11px] text-[color:var(--gp-muted)]">{link.hint}</span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export default async function FarmhouseHubPage(props: Props) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const topVillages = VILLAGES.filter((v) => v.listings >= 2);
  const tailVillages = VILLAGES.filter((v) => v.listings < 2);

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Farmhouses", url: p("/farmhouse") },
          ]),
        )}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={HERO} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-16 pt-12 lg:pb-20 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/85">Farmhouses</span>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">
            {VILLAGES.length} pockets · {BELT_STATS.listings} listings
          </GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">
            Every pocket of the Sohna belt, with what it actually asks.
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            Search the belt the way people buy in it — by village, by plot size, by budget, by
            configuration, or by how far it is from where you live. Every page carries that slice&rsquo;s
            own listing count, median asking price and price per square foot, so you can tell a
            genuinely cheap pocket from one that is cheap for a reason.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4">
            {[
              { label: "Listings tracked", value: String(BELT_STATS.listings) },
              { label: "Median asking", value: crore(BELT_STATS.medianPrice) },
              { label: "Median plot", value: acres(BELT_STATS.medianArea) },
              { label: "Median rate", value: perSqft(BELT_STATS.medianPerSqft) },
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

      {/* ── By village ───────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>By pocket</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Where in the belt
          </h2>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
            Ordered by how much is currently listed, which is also roughly how much negotiating
            room you have. A pocket with two listings gives you none.
          </p>

          <div className="mt-8 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                  <th className="px-4 py-3 font-semibold">Pocket</th>
                  <th className="px-4 py-3 font-semibold">Listings</th>
                  <th className="px-4 py-3 font-semibold">Median asking</th>
                  <th className="px-4 py-3 font-semibold">Median plot</th>
                  <th className="px-4 py-3 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {topVillages.map((village) => (
                  <tr key={village.slug} className="border-t border-[color:var(--gp-border)]">
                    <td className="px-4 py-2.5">
                      <Link
                        href={p(`/farmhouse/in-${village.slug}`)}
                        className="font-medium text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                      >
                        {village.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{village.listings}</td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                      {crore(village.medianPrice)}
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                      {acres(village.medianArea)}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[color:var(--gp-gold-600)]">
                      {perSqft(village.medianPerSqft)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-[13px] font-semibold text-[color:var(--gp-ink)]">
            Smaller pockets, one listing each
          </p>
          <Pills
            links={tailVillages.map((v) => ({
              label: v.name,
              href: p(`/farmhouse/in-${v.slug}`),
            }))}
          />
          <p className="mt-6 text-[13px] font-semibold text-[color:var(--gp-ink)]">
            Pockets we do not hold listings in yet
          </p>
          <Pills
            links={ADJACENT.map((a) => ({ label: a.name, href: p(`/farmhouse/in-${a.slug}`) }))}
          />

          <p className="mt-6 text-[13px] font-semibold text-[color:var(--gp-ink)]">
            Looking for a dealer rather than a listing
          </p>
          <Pills
            links={VILLAGES.slice(0, 12).map((v) => ({
              label: `Dealer in ${v.name}`,
              href: p(`/property-dealer/${v.slug}`),
            }))}
          />

          <p className="mt-4 text-[12px] text-[color:var(--gp-muted)]">
            Figures are asking prices from current listings, not transacted rates.
          </p>
        </GpContainer>
      </GpSection>

      {/* ── Facets ───────────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>By what you are looking for</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Narrow the belt
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-9 lg:grid-cols-2">
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Plot size</p>
              <Pills links={SIZES.map((s) => ({ label: s.label, href: p(`/farmhouse/${s.slug}`) }))} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">
                Bare farm land, by size
              </p>
              <Pills
                links={SIZES.map((s) => ({
                  label: s.label,
                  href: p(`/farmhouse/${s.slug}-farm-land`),
                }))}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Budget</p>
              <Pills
                links={BUDGETS.map((b) => ({ label: b.label, href: p(`/farmhouse/${b.slug}`) }))}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Configuration</p>
              <Pills
                links={BHKS.map((n) => ({ label: `${n} BHK`, href: p(`/farmhouse/${n}-bhk`) }))}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Aspect</p>
              <Pills
                links={FACINGS.map((f) => ({
                  label: f.label,
                  href: p(`/farmhouse/${f.slug}-facing`),
                }))}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Roads &amp; corridors</p>
              <Pills links={ROADS.map((r) => ({ label: r.name, href: p(`/farmhouse/in-${r.slug}`) }))} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">
                Pin codes
              </p>
              <Pills
                links={PINCODES.map((pin) => ({
                  label: pin.code,
                  href: p(`/pin-code/${pin.code}`),
                  hint: pin.name,
                }))}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Features</p>
              <Pills
                links={FEATURES.map((f) => ({
                  label: f.label.replace(/^(with |that are |on |in )/, ""),
                  href: p(`/farmhouse/${f.slug}`),
                }))}
              />
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* ── Distance and comparisons ─────────────────────────────────── */}
      <GpSection tone="forest">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">By drive time</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-white">
                How far is it from you
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">
                The thing people underestimate and then regret. Fifteen minutes further out is a
                different property at the same money — and a different property to persuade guests
                to visit.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {LANDMARKS.map((landmark) => (
                  <Link
                    key={landmark.slug}
                    href={p(`/farmhouse/near-${landmark.slug}`)}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-white/30 px-4 text-[12.5px] font-medium text-white transition-colors hover:border-[color:var(--gp-gold-300)] hover:text-[color:var(--gp-gold-300)]"
                  >
                    Near {landmark.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">Head to head</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-white">
                Two pockets compared
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">
                Listing count, median asking price, plot size and rate, side by side — with what
                the numbers leave out.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {comparablePairs()
                  .slice(0, 16)
                  .map(([a, b]) => (
                    <Link
                      key={`${a.slug}-${b.slug}`}
                      href={p(`/farmhouse/${a.slug}-vs-${b.slug}`)}
                      className="inline-flex min-h-[40px] items-center rounded-full border border-white/30 px-4 text-[12.5px] font-medium text-white transition-colors hover:border-[color:var(--gp-gold-300)] hover:text-[color:var(--gp-gold-300)]"
                    >
                      {a.name} vs {b.name}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* ── Estates and land rates ───────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <GpEyebrow>By estate</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                Named farm estates
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Most of the belt&rsquo;s inventory sits inside a handful of named estates, and the
                estate&rsquo;s own approach road and upkeep matter as much as the plot inside it.
              </p>
              <Pills
                links={ESTATES.filter((e) => e.listings >= 2).map((e) => ({
                  label: e.name,
                  href: p(`/estates/${e.slug}`),
                  hint: String(e.listings),
                }))}
              />
              <Link
                href={p("/estates")}
                className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
              >
                All {ESTATES.length} estates
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div>
              <GpEyebrow>Rates and paperwork</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                What the government values it at
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Stamp duty and registry are calculated on the circle rate, not on what you pay. The
                gap between the two is the single most useful number in a land purchase, and it is
                different in every village.
              </p>
              <Pills
                links={VILLAGES.slice(0, 12).map((v) => ({
                  label: `${v.name} rates`,
                  href: p(`/land-rates/${v.slug}`),
                }))}
              />
              <Link
                href={p("/land-rates")}
                className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
              >
                Land rates across the belt
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
