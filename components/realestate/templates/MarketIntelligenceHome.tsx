import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Percent,
  Boxes,
  IndianRupee,
  Download,
  Check,
  Train,
  Building2,
  Route,
  Briefcase,
  Phone,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import PropertyCard from "../PropertyCard";
import PriceTrendChart from "../PriceTrendChart";
import SectorCompare from "../SectorCompare";
import SearchBar from "../SearchBar";
import { Band, SectionTitle } from "../sections/shared";
import { getBasePath, joinPath, type Tenant } from "@/lib/tenant";
import {
  getFirmSettings,
  getProperties,
  getPropertyImages,
  getLocalities,
  getPublishedUpdates,
} from "@/lib/content";
import { formatDate } from "@/lib/format";

/**
 * Template 3 — Market Intelligence.
 * Reference: ~/Downloads/high-properties-4-template-hd/03-market-intelligence/
 *
 * Data-first research hub. Its design system deliberately diverges from the
 * other three: a near-black charcoal hero and dark data surfaces (the pack's
 * DESIGN-SYSTEM.md explicitly allows "deep navy-charcoal surfaces while
 * retaining gold accents"), tabular/numeric emphasis over photography, and
 * a report download rather than a property enquiry as the primary CTA.
 * The charcoal shift is applied through [data-template="market-intelligence"]
 * in globals.css, so the same components render darker here.
 */

const KPI_ICONS = {
  price: IndianRupee,
  appreciation: TrendingUp,
  yield: Percent,
  inventory: Boxes,
} as const;

const INFRASTRUCTURE = [
  {
    icon: Route,
    title: "Dwarka Expressway Opening",
    detail: "Direct connectivity to Delhi and IGI Airport",
    status: "Operational",
  },
  {
    icon: Train,
    title: "Metro Expansion (Phase 2)",
    detail: "New lines covering Gurugram sectors",
    status: "2024–2026",
  },
  {
    icon: Route,
    title: "Southern Peripheral Road (SPR)",
    detail: "Improved intra-city connectivity",
    status: "2024–2025",
  },
  {
    icon: Briefcase,
    title: "Global City & Business Hubs",
    detail: "New commercial nodes and job creation",
    status: "Ongoing",
  },
];

const TRUST_STATS = [
  { value: "10,000+", label: "Happy Clients" },
  { value: "1,000+", label: "Transactions Closed" },
  { value: "12+", label: "Years of Experience" },
  { value: "₹2,500+ Cr", label: "Sales Value" },
  { value: "25+", label: "Market Experts" },
];

/** Deterministic demo series — a placeholder for a real price-history feed. */
function buildTrendSeries(base: number) {
  const labels = ["May '21", "Nov '21", "May '22", "Nov '22", "May '23", "Nov '23", "May '24", "Now"];
  return labels.map((label, i) => ({
    label,
    value: Math.round(base * (0.72 + i * 0.042)),
  }));
}

export default async function MarketIntelligenceHome({ tenant }: { tenant: Tenant }) {
  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [settings, allProperties, localities, updates] = await Promise.all([
    getFirmSettings(tenant.id),
    getProperties(tenant.id, {}),
    getLocalities(tenant.id),
    getPublishedUpdates(tenant.id),
  ]);
  if (!settings) return null;

  const opportunities = allProperties.slice(0, 5);
  const imageEntries = await Promise.all(
    opportunities.map(async (property) => {
      const images = await getPropertyImages(property.id);
      const primary = images.find((i) => i.isPrimary) ?? images[0] ?? null;
      return [property.id, primary ? { path: primary.path, alt: primary.alt } : undefined] as const;
    }),
  );
  const imageMap = Object.fromEntries(imageEntries);

  // Headline KPIs are derived from the locality rows the dashboard manages,
  // so the snapshot and the locality pages can never disagree.
  const priced = localities.filter((l) => l.avgPricePerSqft !== null);
  const avgPrice = priced.length
    ? Math.round(priced.reduce((sum, l) => sum + (l.avgPricePerSqft ?? 0), 0) / priced.length)
    : null;
  const withYoy = localities.filter((l) => l.yoyChangePercent !== null);
  const avgYoy = withYoy.length
    ? withYoy.reduce((sum, l) => sum + (l.yoyChangePercent ?? 0), 0) / withYoy.length
    : null;
  const withYield = localities.filter((l) => l.rentalYieldPercent !== null);
  const avgYield = withYield.length
    ? withYield.reduce((sum, l) => sum + (l.rentalYieldPercent ?? 0), 0) / withYield.length
    : null;
  const totalProjects = localities.reduce((sum, l) => sum + (l.activeProjects ?? 0), 0);

  const kpis = [
    {
      icon: KPI_ICONS.price,
      label: "Average Price",
      value: avgPrice ? `₹${avgPrice.toLocaleString("en-IN")}/sq.ft` : "—",
      note: "All residential · overall",
    },
    {
      icon: KPI_ICONS.appreciation,
      label: "Annual Appreciation (YoY)",
      value: avgYoy !== null ? `${avgYoy >= 0 ? "" : "−"}${Math.abs(avgYoy).toFixed(1)}%` : "—",
      note: "Past 12 months",
    },
    {
      icon: KPI_ICONS.yield,
      label: "Rental Yield",
      value: avgYield !== null ? `${avgYield.toFixed(1)}%` : "—",
      note: "Gross · overall",
    },
    {
      icon: KPI_ICONS.inventory,
      label: "Active Projects",
      value: totalProjects ? `${totalProjects}` : "—",
      note: "Across tracked corridors",
    },
  ];

  const ranked = [...localities]
    .filter((l) => l.avgPricePerSqft !== null)
    .sort((a, b) => (b.avgPricePerSqft ?? 0) - (a.avgPricePerSqft ?? 0));

  const trendSeries = buildTrendSeries(avgPrice ?? 12000);

  return (
    <>
      {/* ── Hero + live market snapshot ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-deep">
        <Image
          src="/verticals/realestate/templates/market-intelligence/images/hero-market-intelligence.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy-deep/70 to-navy-deep/95" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
          <h1 className="display-xl max-w-2xl text-white">Understand the market before you invest.</h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
            Real-time Gurugram market intelligence for smarter decisions and stronger returns.
          </p>

          <div className="mt-7 max-w-xl">
            <SearchBar action={p("/properties")} placeholder="Search sector, locality or project…" />
          </div>

          <div className="mt-9 rounded-[10px] border border-white/12 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Live Market Snapshot (Gurugram)
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="flex gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <dt className="text-[11.5px] text-white/55">{kpi.label}</dt>
                      <dd>
                        <span className="mt-0.5 block font-display text-[20px] font-medium text-white">
                          {kpi.value}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-white/40">{kpi.note}</span>
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>
            <p className="mt-5 border-t border-white/10 pt-3 text-center text-[11px] text-white/40">
              Data updated {formatDate(settings.updatedAt)} · Source: {settings.firmName} Research ·
              Figures are indicative and require independent verification
            </p>
          </div>
        </div>
      </section>

      {/* ── Corridor map / overview ───────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle
          title="Explore. Compare. Invest."
          subtitle="Every corridor we track, with live price, appreciation and inventory data."
          href={p("/localities")}
          linkLabel="All localities"
        />
        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {localities.map((locality) => (
              <Link
                key={locality.id}
                href={p(`/localities/${locality.slug}`)}
                className="flex items-center justify-between gap-4 rounded-[8px] border border-line bg-surface px-4 py-3.5 hover:border-accent-ring"
              >
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">{locality.name}</p>
                  {locality.corridor ? (
                    <p className="mt-0.5 text-[11.5px] text-ink-subtle">{locality.corridor}</p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-[14px] font-medium text-ink">
                    {locality.avgPricePerSqft ? `₹${locality.avgPricePerSqft.toLocaleString("en-IN")}` : "—"}
                  </p>
                  {locality.yoyChangePercent !== null ? (
                    <p
                      className={`mt-0.5 flex items-center justify-end gap-1 text-[11.5px] font-medium ${
                        locality.yoyChangePercent >= 0 ? "text-status-success" : "text-status-danger"
                      }`}
                    >
                      {locality.yoyChangePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="h-3 w-3" aria-hidden="true" />
                      )}
                      {Math.abs(locality.yoyChangePercent)}%
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          {ranked[0] ? (
            <div className="rounded-[10px] border border-line bg-navy p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Highest priced corridor
              </p>
              <p className="mt-2 font-display text-[22px] text-white">{ranked[0].name}</p>
              {ranked[0].corridor ? (
                <p className="mt-0.5 text-[12px] text-white/50">{ranked[0].corridor}</p>
              ) : null}
              <dl className="mt-5 space-y-3 border-t border-white/10 pt-4">
                {[
                  { label: "Average Price", value: ranked[0].avgPricePerSqft ? `₹${ranked[0].avgPricePerSqft.toLocaleString("en-IN")}/sq.ft` : "—" },
                  { label: "YoY Appreciation", value: ranked[0].yoyChangePercent !== null ? `${ranked[0].yoyChangePercent}%` : "—" },
                  { label: "Rental Yield", value: ranked[0].rentalYieldPercent !== null ? `${ranked[0].rentalYieldPercent}%` : "—" },
                  { label: "Active Projects", value: ranked[0].activeProjects ? `${ranked[0].activeProjects}` : "—" },
                  { label: "Best For", value: ranked[0].bestFor ?? "—" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
                    <dt className="text-[12px] text-white/50">{row.label}</dt>
                    <dd className="text-right text-[12.5px] font-medium text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={p(`/localities/${ranked[0].slug}`)}
                className="mt-5 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[6px] bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover"
              >
                View Sector Insights
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
      </Band>

      {/* ── Ranking + price trend ─────────────────────────────────────── */}
      <Band tone="surface">
        {/* min-w-0 on both columns: a grid item's default min-width is `auto`,
            which refuses to shrink below the table's min-w — without it the
            inner overflow-x-auto never engages and the page scrolls sideways
            on mobile instead. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Top performing localities
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    {["Rank", "Locality", "Avg. Price", "YoY", "Yield"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="pb-2.5 pr-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ranked.map((locality, i) => (
                    <tr key={locality.id}>
                      <td className="py-3 pr-3 text-[12.5px] text-ink-subtle">{i + 1}</td>
                      <td className="pr-3">
                        <Link
                          href={p(`/localities/${locality.slug}`)}
                          className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-ink hover:text-accent"
                        >
                          {locality.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-[13px] tabular-nums text-ink">
                        {locality.avgPricePerSqft?.toLocaleString("en-IN") ?? "—"}
                      </td>
                      <td className="py-3 pr-3 text-[13px] tabular-nums text-status-success">
                        {locality.yoyChangePercent !== null ? `${locality.yoyChangePercent}%` : "—"}
                      </td>
                      <td className="py-3 pr-3 text-[13px] tabular-nums text-ink-muted">
                        {locality.rentalYieldPercent !== null ? `${locality.rentalYieldPercent}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              href={p("/localities")}
              className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 text-[13px] font-medium text-navy hover:text-accent"
            >
              View All Localities
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Price trend (all residential)
            </p>
            <div className="mt-4 rounded-[10px] border border-line bg-tint p-4">
              <PriceTrendChart points={trendSeries} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-subtle">
              Indicative series derived from tracked corridor averages. Not a transaction-level
              price index — confirm against registry data before relying on it.
            </p>
          </div>
        </div>
      </Band>

      {/* ── Infrastructure catalysts ──────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle
          title="Strong infrastructure. Stronger growth."
          subtitle="The projects shaping Gurugram's next decade of price movement."
          align="center"
        />
        <ol className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INFRASTRUCTURE.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="rounded-[10px] border border-line bg-surface p-5 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                  <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                </span>
                <p className="mt-3 text-[13.5px] font-semibold text-ink">{item.title}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{item.detail}</p>
                <Badge tone="accent" className="mt-3">
                  {item.status}
                </Badge>
              </li>
            );
          })}
        </ol>
      </Band>

      {/* ── Compare sectors ───────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionTitle
          title="Compare up to 3 localities"
          subtitle="Price, appreciation, yield and inventory, side by side."
        />
        <div className="mt-6">
          <SectorCompare
            localities={localities.map((l) => ({
              slug: l.slug,
              name: l.name,
              avgPricePerSqft: l.avgPricePerSqft,
              yoyChangePercent: l.yoyChangePercent,
              rentalYieldPercent: l.rentalYieldPercent,
              activeProjects: l.activeProjects,
              bestFor: l.bestFor,
            }))}
          />
        </div>
      </Band>

      {/* ── Curated opportunities ─────────────────────────────────────── */}
      {opportunities.length > 0 ? (
        <Band tone="tint">
          <SectionTitle
            title="Curated investment opportunities"
            href={p("/properties")}
            linkLabel="View all opportunities"
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {opportunities.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={p(`/properties/${property.slug}`)}
                imagePath={imageMap[property.id]?.path}
                imageAlt={imageMap[property.id]?.alt ?? undefined}
              />
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── Report + analysis ─────────────────────────────────────────── */}
      <Band tone="surface">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[12px] bg-navy p-6 text-white">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-display text-[22px] leading-tight text-white">
                  Quarterly Gurugram Market Report
                </p>
                <p className="mt-2.5 text-[13px] leading-relaxed text-white/65">
                  Comprehensive analysis of price trends, supply, demand, rentals and upcoming
                  infrastructure impact.
                </p>
                <Link
                  href={p("/contact?intent=report")}
                  className="mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-[6px] bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Request the Report
                </Link>
                <ul className="mt-5 space-y-1.5 border-t border-white/10 pt-4">
                  {[
                    "Residential & commercial overview",
                    "Micro-market deep dive",
                    "Price & rental trends",
                    "Future outlook",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] text-white/60">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mx-auto aspect-[3/4] w-[150px] shrink-0 overflow-hidden rounded-[8px]">
                <Image
                  src="/verticals/realestate/templates/market-intelligence/images/market-report-cover.webp"
                  alt=""
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <SectionTitle title="Latest market analysis" href={p("/updates")} linkLabel="View all articles" />
            <ul className="mt-5 divide-y divide-line rounded-[10px] border border-line">
              {updates.slice(0, 3).map((update) => (
                <li key={update.id}>
                  <Link href={p(`/updates/${update.slug}`)} className="block px-4 py-4 hover:bg-tint">
                    <p className="text-[13.5px] font-medium leading-snug text-ink">{update.title}</p>
                    <p className="mt-1.5 text-[11.5px] text-ink-subtle">
                      {update.publishedAt ? formatDate(update.publishedAt) : ""}
                      {update.category ? ` · ${update.category}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      {/* ── Analyst CTA ───────────────────────────────────────────────── */}
      <Band tone="navy">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-lg text-white">Speak to our market analysts</h2>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/70">
              Get personalised insights, investment guidance and the best opportunities tailored to
              your thesis.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {["Data-led Insights", "Unbiased Advice", "End-to-end Support"].map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-[12.5px] text-white/70">
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={p("/contact")}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-[6px] bg-accent px-6 text-[14px] font-medium text-white hover:bg-accent-hover"
            >
              Book a Consultation
            </Link>
            {settings.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-[6px] border border-white/25 px-6 text-[14px] font-medium text-white hover:border-white/60"
              >
                <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                {settings.phone}
              </a>
            ) : null}
          </div>
        </div>
      </Band>

      {/* ── Trust stats ───────────────────────────────────────────────── */}
      <Band tone="tint">
        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-[24px] font-medium text-navy">{stat.value}</span>
                <span className="mt-1 block text-[11.5px] text-ink-subtle">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-center text-[11px] text-ink-subtle">
          Figures are illustrative for this template and require confirmation before publication.
        </p>
      </Band>
    </>
  );
}
