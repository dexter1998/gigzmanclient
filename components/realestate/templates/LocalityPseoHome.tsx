import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  Gauge,
  Home as HomeIcon,
  FileClock,
  Quote,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import FaqAccordion from "@/components/site/FaqAccordion";
import PropertyCard from "../PropertyCard";
import PropertyTypeIcon from "../PropertyTypeIcon";
import SearchBar from "../SearchBar";
import SectorCompare from "../SectorCompare";
import { Band, SectionTitle, DeveloperLogos, DEVELOPER_LOGOS } from "../sections/shared";
import { getBasePath, joinPath, type Tenant } from "@/lib/tenant";
import {
  getFirmSettings,
  getProperties,
  getPropertyImages,
  getLocalities,
  getPublishedUpdates,
} from "@/lib/content";
import { PROPERTY_TYPE_LABELS, formatDate } from "@/lib/format";
import { buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";

/**
 * Template 4 — Locality / pSEO.
 * Reference: ~/Downloads/high-properties-4-template-hd/04-locality-pseo/
 *
 * Built for programmatic SEO: a centred search hero, then dense, crawlable
 * directory blocks (corridors, sectors, property types, developers,
 * calculators, guides) with a visible freshness signal and FAQ schema. Its
 * anatomy is the inverse of the Premium Inventory template — internal
 * linking breadth first, individual inventory second.
 */

const CALCULATORS = [
  { key: "emi", label: "EMI Calculator", detail: "Calculate your monthly home loan EMI.", icon: Calculator },
  { key: "stamp-duty", label: "Stamp Duty Calculator", detail: "Check stamp duty & registration charges.", icon: FileText },
  { key: "rental-yield", label: "Rental Yield Calculator", detail: "Estimate rental return on your investment.", icon: Gauge },
];

const TESTIMONIALS = [
  {
    quote:
      "Geeta Properties helped me find the right home in my budget. Transparent process, and the team knew every sector we asked about.",
    name: "Rahul Malhotra",
    role: "Homebuyer",
  },
  {
    quote:
      "As an NRI investor, I needed ground insights. Their advice on Dwarka Expressway proved to be excellent.",
    name: "Neha Arora",
    role: "NRI Investor",
  },
  {
    quote:
      "Sold my property at a good price with their professional marketing and verified buyer network.",
    name: "Vikram Bansal",
    role: "Property Seller",
  },
];

const FAQS = [
  {
    question: "Which are the best sectors to invest in Gurugram?",
    answer:
      "It depends on your horizon. Established corridors like Golf Course Road hold value and let easily; Dwarka Expressway and New Gurugram carry higher appreciation potential but longer possession timelines. Each locality page on this site shows price, YoY change and rental yield so you can compare directly.",
  },
  {
    question: "What is the average price of property in Gurugram?",
    answer:
      "Average price varies sharply by corridor — from around ₹7,600/sq.ft on emerging corridors to ₹18,500/sq.ft on Golf Course Road. The locality pages carry the current tracked figure for each corridor.",
  },
  {
    question: "How is Dwarka Expressway for investment?",
    answer:
      "Dwarka Expressway has recorded the fastest price appreciation among the corridors tracked here, driven by improved Delhi connectivity and a wave of new-launch supply. Most inventory is under construction, so possession-timeline risk should be weighed against the lower entry price.",
  },
  {
    question: "How do I check a property's RERA registration?",
    answer:
      "Every listing on this site shows its RERA registration number, or states plainly that registration is pending. Verify any number directly on the Haryana RERA portal before committing — the registration record there also shows the approved plan and promised timeline.",
  },
  {
    question: "What documents are required to buy a property?",
    answer:
      "Typically identity and address proof, PAN, income and bank statements for a loan, plus the sale agreement, title chain, encumbrance certificate and approved building plan from the seller's side. Your advisor will share a checklist specific to the transaction.",
  },
  {
    question: "Do you assist with home loans and legal verification?",
    answer:
      "We can introduce you to lenders and coordinate documentation, and we run a title, RERA and approvals check on every property we recommend. We are not a lender and do not receive referral commission.",
  },
];

export default async function LocalityPseoHome({ tenant }: { tenant: Tenant }) {
  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [settings, allProperties, localities, updates] = await Promise.all([
    getFirmSettings(tenant.id),
    getProperties(tenant.id, {}),
    getLocalities(tenant.id),
    getPublishedUpdates(tenant.id),
  ]);
  if (!settings) return null;

  const newLaunches = allProperties.filter((prop) => prop.status === "new_launch").slice(0, 4);
  const imageEntries = await Promise.all(
    newLaunches.map(async (property) => {
      const images = await getPropertyImages(property.id);
      const primary = images.find((i) => i.isPrimary) ?? images[0] ?? null;
      return [property.id, primary ? { path: primary.path, alt: primary.alt } : undefined] as const;
    }),
  );
  const imageMap = Object.fromEntries(imageEntries);

  // Property counts per locality drive the "active projects" figure on the
  // sector cards, so the directory can't claim inventory that isn't seeded.
  const sectorCards = localities.map((locality) => ({
    ...locality,
    listingCount: allProperties.filter((prop) => prop.locality === locality.name).length,
  }));

  const faqJsonLd = buildFaqJsonLd(FAQS);

  return (
    <>
      {faqJsonLd ? <script {...jsonLdProps(faqJsonLd)} /> : null}

      {/* ── Hero + locality search ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy">
        <Image
          src="/verticals/realestate/templates/locality-pseo/images/hero-locality-discovery.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/65 via-navy-deep/45 to-navy-deep/85" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-14 text-center sm:px-6 sm:py-18 lg:px-8">
          <h1 className="display-xl text-white">Explore Gurugram, sector by sector.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">
            Discover neighbourhoods. Compare. Decide with confidence.
          </p>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <SearchBar action={p("/properties")} placeholder="Search sector, project or developer…" />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[12px] text-white/55">Popular:</span>
            {localities.slice(0, 4).map((locality) => (
              <Link
                key={locality.id}
                href={p(`/localities/${locality.slug}`)}
                className="inline-flex min-h-[32px] items-center rounded-full border border-white/25 px-3.5 text-[12px] text-white hover:border-accent hover:text-accent-ring"
              >
                {locality.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by corridor ────────────────────────────────────────── */}
      {localities.length > 0 ? (
        <Band tone="tint">
          <SectionTitle title="Browse Gurugram by corridor" href={p("/localities")} linkLabel="View all corridors" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {localities.map((locality) => (
              <Link
                key={locality.id}
                href={p(`/localities/${locality.slug}`)}
                className="group relative aspect-[4/3] overflow-hidden rounded-[10px] bg-navy"
              >
                {locality.heroImage ? (
                  <Image
                    src={locality.heroImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 45vw, 240px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : null}
                <span className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="block text-[13px] font-semibold text-white">{locality.name}</span>
                  {locality.bestFor ? (
                    <span className="mt-0.5 block text-[11px] leading-tight text-white/70">
                      {locality.bestFor}
                    </span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── Popular sectors ───────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionTitle title="Popular sectors in Gurugram" href={p("/localities")} linkLabel="View all sectors" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sectorCards.map((locality) => (
            <Link
              key={locality.id}
              href={p(`/localities/${locality.slug}`)}
              className="flex gap-3.5 rounded-[10px] border border-line bg-surface p-4 hover:border-accent-ring"
            >
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-tint">
                {locality.heroImage ? (
                  <Image src={locality.heroImage} alt="" fill sizes="72px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-ink">{locality.name}</p>
                {locality.corridor ? (
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-subtle">{locality.corridor}</p>
                ) : null}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-[15px] font-medium text-ink">
                    {locality.avgPricePerSqft ? `₹${locality.avgPricePerSqft.toLocaleString("en-IN")}` : "—"}
                  </span>
                  <span className="text-[10.5px] text-ink-subtle">/ sq.ft</span>
                  {locality.yoyChangePercent !== null ? (
                    <span
                      className={`ml-auto flex items-center gap-0.5 text-[11px] font-medium ${
                        locality.yoyChangePercent >= 0 ? "text-status-success" : "text-status-danger"
                      }`}
                    >
                      {locality.yoyChangePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="h-3 w-3" aria-hidden="true" />
                      )}
                      {Math.abs(locality.yoyChangePercent)}%
                    </span>
                  ) : null}
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2">
                  <span className="text-[11px] text-ink-subtle">
                    {locality.listingCount} {locality.listingCount === 1 ? "listing" : "listings"}
                  </span>
                  {locality.bestFor ? (
                    <span className="truncate text-[11px] text-accent">{locality.bestFor}</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-ink-subtle">
          Prices last updated {formatDate(settings.updatedAt)} · Source: {settings.firmName} Research
        </p>
      </Band>

      {/* ── Featured new launches ─────────────────────────────────────── */}
      {newLaunches.length > 0 ? (
        <Band tone="tint">
          <SectionTitle
            title="Featured new-launch projects"
            href={p("/properties?status=new_launch")}
            linkLabel="View all new launches"
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {newLaunches.map((property) => (
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

      {/* ── Browse by property type ───────────────────────────────────── */}
      <Band tone="surface">
        <SectionTitle title="Browse by property type" align="center" />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <Link
              key={value}
              href={p(`/properties?type=${value}`)}
              className="flex flex-col items-center gap-2.5 rounded-[10px] border border-line p-5 text-center hover:border-accent-ring"
            >
              <PropertyTypeIcon propertyType={value} boxed boxClassName="h-12 w-12 rounded-[9px] bg-tint" />
              <span className="text-[12.5px] font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </Band>

      {/* ── Top developers ────────────────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle title="Top developers in Gurugram" align="center" />
        <div className="mt-7">
          <DeveloperLogos logos={DEVELOPER_LOGOS} />
        </div>
      </Band>

      {/* ── Useful calculators ────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionTitle title="Useful tools" href={p("/calculators")} linkLabel="All calculators" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CALCULATORS.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link
                key={calc.key}
                href={p(`/calculators/${calc.key}`)}
                className="flex items-start gap-3 rounded-[10px] border border-line bg-surface p-5 hover:border-accent-ring"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">{calc.label}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-subtle">{calc.detail}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-navy">
                    Calculate now
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Band>

      {/* ── Guides + news ─────────────────────────────────────────────── */}
      {updates.length > 0 ? (
        <Band tone="tint">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <SectionTitle title="Gurugram market guides" href={p("/updates")} linkLabel="View all guides" />
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {updates.slice(0, 3).map((update) => (
                  <Link
                    key={update.id}
                    href={p(`/updates/${update.slug}`)}
                    className="overflow-hidden rounded-[10px] border border-line bg-surface hover:border-accent-ring"
                  >
                    <div className="p-4">
                      <p className="text-[13px] font-semibold leading-snug text-ink">{update.title}</p>
                      <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-ink-muted">
                        {update.excerpt}
                      </p>
                      <p className="mt-3 text-[11px] text-ink-subtle">
                        {update.publishedAt ? formatDate(update.publishedAt) : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle title="Infrastructure & news" />
              <ul className="mt-5 divide-y divide-line rounded-[10px] border border-line bg-surface">
                {updates.slice(0, 3).map((update) => (
                  <li key={`news-${update.id}`}>
                    <Link href={p(`/updates/${update.slug}`)} className="block px-4 py-3.5 hover:bg-tint">
                      <p className="text-[12.5px] font-medium leading-snug text-ink">{update.title}</p>
                      <p className="mt-1 text-[11px] text-ink-subtle">
                        {update.publishedAt ? formatDate(update.publishedAt) : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Band>
      ) : null}

      {/* ── Compare localities ────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionTitle
          title="Compare localities"
          subtitle="Select up to 3 localities to compare price trends, inventory and lifestyle."
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

      {/* ── Latest updated pages ──────────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle title="Latest updated pages" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {localities.map((locality) => (
            <Link
              key={locality.id}
              href={p(`/localities/${locality.slug}`)}
              className="rounded-[8px] border border-line bg-surface p-3.5 hover:border-accent-ring"
            >
              <FileClock className="h-4 w-4 text-accent" aria-hidden="true" />
              <p className="mt-2 text-[12px] font-medium leading-snug text-ink">{locality.name}</p>
              <p className="mt-1 text-[10.5px] text-ink-subtle">
                Updated {formatDate(locality.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      </Band>

      {/* ── Personalised locality report ──────────────────────────────── */}
      <Band tone="navy">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-lg text-white">Get a personalised locality report</h2>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/70">
              Price trends, top projects, rental yield and more — prepared for the localities you
              care about and sent across after a short conversation.
            </p>
          </div>
          <Link
            href={p("/contact?intent=locality-report")}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-[6px] bg-accent px-7 text-[14px] font-medium text-white hover:bg-accent-hover"
          >
            Get My Report
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Band>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      {settings.reviewsEnabled ? (
        <Band tone="surface">
          <SectionTitle title="What our clients say" align="center" />
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-[10px] border border-line bg-tint p-5">
                <Quote className="h-5 w-5 text-accent" aria-hidden="true" />
                <blockquote className="mt-3 text-[13px] leading-relaxed text-ink-muted">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 border-t border-line pt-3">
                  <span className="block text-[12.5px] font-semibold text-ink">{t.name}</span>
                  <span className="block text-[11px] text-ink-subtle">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle title="Frequently asked questions" align="center" />
        <div className="mx-auto mt-6 max-w-3xl">
          <FaqAccordion faqs={FAQS} />
        </div>
      </Band>
    </>
  );
}
