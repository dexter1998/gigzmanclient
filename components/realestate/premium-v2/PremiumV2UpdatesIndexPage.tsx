import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  FileText,
  Landmark,
  Route,
  TrainFront,
} from "lucide-react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import UpdatesNewsletterFormV2 from "./UpdatesNewsletterFormV2";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getPublishedUpdates, getLocalities } from "@/lib/content";
import { formatDate } from "@/lib/format";

const IMAGES_BASE = "/verticals/realestate/templates/premium-v2/images";

/** Round-robin decorative art for the "latest updates" grid — these are
 * generic corridor photography, not per-article images (the update model
 * has no image field), so they're picked to avoid repeating a photo twice
 * in the same 4-up grid rather than implying a specific update-to-photo
 * relationship. */
const UPDATE_CARD_IMAGES = [
  `${IMAGES_BASE}/corridor-new-gurugram.png`,
  `${IMAGES_BASE}/corridor-sohna-road.webp`,
  `${IMAGES_BASE}/corridor-golf-course-road.png`,
  `${IMAGES_BASE}/corridor-dwarka-expressway.png`,
];

interface ReportArchiveItem {
  title: string;
  description: string;
  href: string;
}

/** Editorial teaser titles for our own published notes grouped by theme —
 * not a separate report/PDF system. Three map straight to the real update
 * categories seeded for this client; the fourth (nothing to filter into
 * yet) routes to a real advisor request instead of a fake download. */
function buildReportArchive(p: (path: string) => string): ReportArchiveItem[] {
  return [
    {
      title: "Residential Market Outlook",
      description: "Pricing and demand notes across every corridor we track.",
      href: p(`/updates?category=${encodeURIComponent("Market Trends")}`),
    },
    {
      title: "Regulatory & RERA Briefings",
      description: "Registration, approvals and compliance changes buyers should know.",
      href: p(`/updates?category=${encodeURIComponent("Regulatory")}`),
    },
    {
      title: "Buyer's Due Diligence Guide",
      description: "What to verify before booking, from title to possession.",
      href: p(`/updates?category=${encodeURIComponent("Buying Guide")}`),
    },
    {
      title: "Custom Corridor Report",
      description: "Ask an advisor for a report scoped to a specific corridor or budget.",
      href: p("/contact?intent=report"),
    },
  ];
}

interface TimelineItem {
  corridor: string;
  title: string;
  detail: string;
  icon: typeof Route;
}

/** Illustrative/editorial context, not a live infrastructure feed — see the
 * caption below the timeline. Each item is grounded in one of the five real
 * corridors this template already tracks, rather than an invented location. */
const INFRASTRUCTURE_TIMELINE: TimelineItem[] = [
  {
    corridor: "Dwarka Expressway",
    title: "Dwarka Expressway connectivity",
    detail:
      "Improved access toward Delhi and IGI Airport continues to be the single biggest driver of demand along this corridor.",
    icon: Route,
  },
  {
    corridor: "New Gurugram",
    title: "Metro expansion toward New Gurugram",
    detail:
      "Planned metro connectivity is widely watched by buyers here — it tends to move sentiment before it moves prices.",
    icon: TrainFront,
  },
  {
    corridor: "Southern Peripheral Road",
    title: "Southern Peripheral Road (SPR) upgrades",
    detail:
      "Road-widening and junction work along SPR is gradually improving commute times to Golf Course Road and Sohna Road.",
    icon: Landmark,
  },
  {
    corridor: "Golf Course Road",
    title: "Global City & business-hub expansion",
    detail:
      "New commercial and business-district development near Golf Course Road keeps rental demand from occupiers steady.",
    icon: Building2,
  },
];

export default async function PremiumV2UpdatesIndexPage({
  tenant,
  searchParams,
}: {
  tenant: Tenant;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const activeCategory = typeof searchParams.category === "string" ? searchParams.category : null;

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [settings, updates, localities] = await Promise.all([
    getFirmSettings(tenant.id),
    getPublishedUpdates(tenant.id),
    getLocalities(tenant.id),
  ]);
  if (!settings) notFound();

  const categories = [...new Set(updates.map((u) => u.category))];
  const visible = activeCategory ? updates.filter((u) => u.category === activeCategory) : updates;

  const mostRecentUpdate = updates[0] ?? null;
  const latestFour = updates.slice(0, 4);

  // Real, computed snapshot — same honesty discipline as MarketIntelligenceV2:
  // every figure below traces to a tracked locality row, nothing invented.
  const priced = localities.filter((loc) => typeof loc.avgPricePerSqft === "number");
  const withYoy = localities.filter((loc) => loc.yoyChangePercent != null);
  const withYield = localities.filter((loc) => loc.rentalYieldPercent != null);

  const avgPricePerSqft =
    priced.length > 0
      ? Math.round(priced.reduce((sum, loc) => sum + (loc.avgPricePerSqft ?? 0), 0) / priced.length)
      : null;
  const avgYoy =
    withYoy.length > 0
      ? withYoy.reduce((sum, loc) => sum + (loc.yoyChangePercent ?? 0), 0) / withYoy.length
      : null;
  const avgRentalYield =
    withYield.length > 0
      ? withYield.reduce((sum, loc) => sum + (loc.rentalYieldPercent ?? 0), 0) / withYield.length
      : null;
  const totalActiveProjects = localities.reduce((sum, loc) => sum + (loc.activeProjects ?? 0), 0);
  const mostRecentVerified = localities.reduce<string | null>((latest, loc) => {
    if (!loc.lastVerifiedAt) return latest;
    if (!latest || loc.lastVerifiedAt > latest) return loc.lastVerifiedAt;
    return latest;
  }, null);

  const maxPrice = priced.length > 0 ? Math.max(...priced.map((loc) => loc.avgPricePerSqft ?? 0)) : null;

  function outlookFor(loc: (typeof localities)[number]): string {
    if (maxPrice != null && loc.avgPricePerSqft === maxPrice) return "Stable Premium";
    if (loc.yoyChangePercent != null && loc.yoyChangePercent > 10) return "High Momentum";
    return "Early Growth";
  }

  const reportArchive = buildReportArchive(p);
  const newsletterImage = `${IMAGES_BASE}/hero-market-intelligence.png`;

  return (
    <>
      {/* 1. Hero — dark forest, real computed live snapshot */}
      <GpSection tone="forest" className="pb-14 pt-12 sm:pt-16">
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-white/55">
            <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span>Market Updates</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">Gurugram Market Updates</GpEyebrow>
              <h1 className="gp-hero-title font-display mt-3 max-w-xl text-white">
                Signals, reports and infrastructure that matter.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/70">
                Corridor-level pricing, regulatory notes and context that could move the market
                next — reviewed before publication, tracked as we see it.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {mostRecentUpdate ? (
                  <a
                    href={p(`/updates/${mostRecentUpdate.slug}`)}
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
                  >
                    Latest Report
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
                <a
                  href="#browse-updates"
                  className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/35 px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-white"
                >
                  Browse Updates
                </a>
              </div>
            </div>

            <div
              className="rounded-[var(--gp-radius-lg)] p-6 sm:p-7"
              style={{ background: "var(--gp-gradient-glass)" }}
            >
              <GpEyebrow>Live Market Snapshot</GpEyebrow>
              <div className="mt-5 grid grid-cols-2 gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                    Avg. Price / Sqft
                  </p>
                  <p className="font-sans mt-1.5 text-[24px] font-semibold text-[color:var(--gp-ink)]">
                    {avgPricePerSqft != null ? `₹${avgPricePerSqft.toLocaleString("en-IN")}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                    Avg. YoY Appreciation
                  </p>
                  <p className="font-sans mt-1.5 text-[24px] font-semibold text-[color:var(--gp-ink)]">
                    {avgYoy != null ? `+${avgYoy.toFixed(1)}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                    Avg. Rental Yield
                  </p>
                  <p className="font-sans mt-1.5 text-[24px] font-semibold text-[color:var(--gp-ink)]">
                    {avgRentalYield != null ? `${avgRentalYield.toFixed(1)}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                    Active Projects
                  </p>
                  <p className="font-sans mt-1.5 text-[24px] font-semibold text-[color:var(--gp-ink)]">
                    {totalActiveProjects}
                  </p>
                </div>
              </div>
              <p className="mt-6 border-t border-[color:var(--gp-border)] pt-4 text-[11.5px] leading-relaxed text-[color:var(--gp-muted)]">
                Updated {formatDate(mostRecentVerified)}. Internally tracked corridor averages, not a
                certified valuation.
              </p>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* 2. Featured analysis */}
      {mostRecentUpdate ? (
        <GpSection tone="cream">
          <GpContainer>
            <div className="grid grid-cols-1 gap-10 overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] lg:grid-cols-2">
              <div className="relative min-h-[260px]">
                <Image
                  src={`${IMAGES_BASE}/market-report-cover.png`}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <GpEyebrow>Featured Analysis</GpEyebrow>
                <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
                  Quarterly Gurugram Market Outlook
                </h2>
                <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[color:var(--gp-gold-600)]">
                  {mostRecentUpdate.category} · {formatDate(mostRecentUpdate.publishedAt)}
                </p>
                <p className="mt-3 max-w-md text-[15px] font-medium leading-snug text-[color:var(--gp-ink)]">
                  {mostRecentUpdate.title}
                </p>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                  {mostRecentUpdate.excerpt}
                </p>
                <a
                  href={p(`/updates/${mostRecentUpdate.slug}`)}
                  className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-300)]"
                >
                  Read Analysis
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </GpContainer>
        </GpSection>
      ) : null}

      {/* 3. Latest updates grid */}
      {latestFour.length > 0 ? (
        <GpSection tone="cream" className="pt-0">
          <GpContainer>
            <GpEyebrow>Fresh This Month</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 max-w-lg text-[color:var(--gp-ink)]">
              Latest updates
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latestFour.map((update, index) => (
                <Link
                  key={update.id}
                  href={p(`/updates/${update.slug}`)}
                  className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[var(--gp-radius-md)]"
                >
                  <Image
                    src={UPDATE_CARD_IMAGES[index % UPDATE_CARD_IMAGES.length]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white/92 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-ink)]">
                      {update.category}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">
                      {formatDate(update.publishedAt)}
                    </p>
                    <h3 className="gp-overlay-title font-display mt-1 text-white">{update.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </GpContainer>
        </GpSection>
      ) : null}

      {/* Full, filterable archive — the target of the hero's "Browse Updates" CTA */}
      <GpSection tone="cream" className="pt-0" id="browse-updates">
        <GpContainer>
          <div className="border-t border-[color:var(--gp-border)] pt-10">
            <GpEyebrow>All Updates</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 max-w-lg text-[color:var(--gp-ink)]">
              Browse every published note
            </h2>

            {categories.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={p("/updates")}
                  className={`min-h-[38px] rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
                    !activeCategory
                      ? "border-[color:var(--gp-gold-600)] bg-[color:var(--gp-gold-600)] text-white"
                      : "border-[color:var(--gp-border)] text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)]"
                  }`}
                >
                  All Insights
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={p(`/updates?category=${encodeURIComponent(category)}`)}
                    className={`min-h-[38px] rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
                      activeCategory === category
                        ? "border-[color:var(--gp-gold-600)] bg-[color:var(--gp-gold-600)] text-white"
                        : "border-[color:var(--gp-border)] text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)]"
                    }`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <p className="mt-8 rounded-[var(--gp-radius-md)] border border-dashed border-[color:var(--gp-border)] p-10 text-center text-[14px] text-[color:var(--gp-muted)]">
              No insights published in this category yet.
            </p>
          ) : (
            <div className="mt-2 border-t border-[color:var(--gp-border)]">
              {visible.map((update) => (
                <Link
                  key={update.id}
                  href={p(`/updates/${update.slug}`)}
                  className="group flex flex-col gap-3 border-b border-[color:var(--gp-border)] py-8 sm:flex-row sm:items-center sm:gap-8 lg:py-10"
                >
                  <div className="sm:w-44 sm:shrink-0">
                    <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{update.category}</p>
                    <p className="mt-1.5 text-[12px] text-[color:var(--gp-muted)]">
                      {formatDate(update.publishedAt)}
                    </p>
                    {update.status === "outdated" ? (
                      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[color:var(--gp-muted)]">
                        Superseded
                      </p>
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-[18px] leading-snug text-[color:var(--gp-ink)] transition-colors group-hover:text-[color:var(--gp-gold-600)] sm:text-[21px]">
                      {update.title}
                    </h3>
                    <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                      {update.excerpt}
                    </p>
                    {update.authorName ? (
                      <p className="mt-3 text-[12px] text-[color:var(--gp-muted)]">
                        By {update.authorName}
                      </p>
                    ) : null}
                  </div>

                  <ArrowUpRight
                    className="hidden h-5 w-5 shrink-0 text-[color:var(--gp-gold-600)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </GpContainer>
      </GpSection>

      {/* 4. Corridor performance table */}
      {localities.length > 0 ? (
        <GpSection tone="forest">
          <GpContainer>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <GpEyebrow className="text-[color:var(--gp-gold-300)]">Corridor Performance</GpEyebrow>
                <h2 className="gp-section-title font-display mt-2 max-w-lg text-white">
                  One market, different trajectories
                </h2>
              </div>
              <a
                href={p("/localities")}
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-300)] hover:text-white"
              >
                Open corridor explorer
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">Corridor</th>
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">Avg. Price</th>
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">YoY</th>
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">Rental Yield</th>
                    <th className="gp-eyebrow py-3 font-semibold text-white/50">Outlook</th>
                  </tr>
                </thead>
                <tbody>
                  {localities.map((loc) => (
                    <tr key={loc.id} className="border-b border-white/10">
                      <td className="py-3.5 pr-4 font-display text-[15px] text-white">{loc.name}</td>
                      <td className="font-sans py-3.5 pr-4 text-[13.5px] text-white/75">
                        {loc.avgPricePerSqft != null
                          ? `₹${loc.avgPricePerSqft.toLocaleString("en-IN")}/sqft`
                          : "—"}
                      </td>
                      <td className="font-sans py-3.5 pr-4 text-[13.5px] text-white/75">
                        {loc.yoyChangePercent != null
                          ? `${loc.yoyChangePercent >= 0 ? "+" : ""}${loc.yoyChangePercent.toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="font-sans py-3.5 pr-4 text-[13.5px] text-white/75">
                        {loc.rentalYieldPercent != null ? `${loc.rentalYieldPercent.toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-3.5 text-[13px] font-semibold text-[color:var(--gp-gold-300)]">
                        {outlookFor(loc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-white/45">
              Outlook is a simple, rule-based read of our own tracked figures (highest average price,
              or year-on-year growth above 10%) — not a third-party rating.
            </p>
          </GpContainer>
        </GpSection>
      ) : null}

      {/* 5. Infrastructure / context timeline */}
      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>Tracked Context</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 max-w-lg text-[color:var(--gp-ink)]">
            What could move the market next
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[color:var(--gp-body)]">
            An editorial view of the connectivity and development themes we watch alongside our
            corridor data — this is context we track, not a live infrastructure feed.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFRASTRUCTURE_TIMELINE.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-6"
                >
                  <Icon className="h-5 w-5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[color:var(--gp-muted)]">
                    {item.corridor}
                  </p>
                  <h3 className="font-display mt-1.5 text-[15px] text-[color:var(--gp-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </GpContainer>
      </GpSection>

      {/* 6. Report archive */}
      <GpSection tone="cream" className="pt-0">
        <GpContainer>
          <GpEyebrow>Research</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 max-w-lg text-[color:var(--gp-ink)]">
            Research for different decisions
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reportArchive.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group flex flex-col rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-6 transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                <FileText className="h-5 w-5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                <h3 className="font-display mt-4 text-[15px] text-[color:var(--gp-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--gp-gold-600)] group-hover:text-[color:var(--gp-gold-300)]">
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </GpContainer>
      </GpSection>

      {/* 7. Newsletter signup */}
      <section className="relative overflow-hidden">
        <Image src={newsletterImage} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-dark-section)", opacity: 0.9 }} />
        <div className="relative">
          <GpContainer className="py-20 sm:py-28">
            <div className="max-w-lg">
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">Stay Ahead</GpEyebrow>
              <h2 className="gp-section-title font-display mt-3 text-white">
                Get Gurugram updates without the noise.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-white/70">
                One email when a corridor moves, a regulation changes, or a report we&rsquo;d
                actually want to read ourselves goes live. No spam, unsubscribe any time.
              </p>
              <UpdatesNewsletterFormV2 basePath={basePath} />
            </div>
          </GpContainer>
        </div>
      </section>
    </>
  );
}
