import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  ShieldCheck,
  Users,
  Car,
  Home as HomeIcon,
  Sparkles,
  Gem,
  TrendingUp,
  FileText,
  Scale,
  Calculator,
  BookOpen,
} from "lucide-react";
import HeroSearchBar from "../HeroSearchBar";
import ExploreTabs from "../ExploreTabs";
import LocalityCard from "../LocalityCard";
import PropertyCard from "../PropertyCard";
import { getBasePath, joinPath, type Tenant } from "@/lib/tenant";
import { DeveloperLogos, DEVELOPER_LOGOS } from "../sections/shared";
import {
  getFirmSettings,
  getProperties,
  getPropertyImages,
  getPropertyLocalityFacets,
  getLocalities,
  getPublishedUpdates,
} from "@/lib/content";

const TRUST_STRIP = [
  {
    icon: ShieldCheck,
    title: "Verified project information",
    detail: "RERA details, prices and availability confirmed before a listing goes live.",
  },
  {
    icon: Users,
    title: "Local market experts",
    detail: "Deep Gurugram micro-market knowledge, corridor by corridor.",
  },
  {
    icon: Car,
    title: "Assisted site visits",
    detail: "Free pick-up and end-to-end support for every shortlisted property.",
  },
];

const INTENTS = [
  { icon: HomeIcon, label: "Ready to Move", status: "ready_to_move" },
  { icon: Sparkles, label: "New Launch", status: "new_launch" },
  { icon: Gem, label: "Luxury Living", status: null, minBeds: 4 },
  { icon: TrendingUp, label: "High Yield Commercial", status: null, propertyType: "commercial" },
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: "100% Verified Listings",
    detail: "RERA details, approvals and documents verified before publishing.",
  },
  {
    icon: Scale,
    title: "Best Price, Always",
    detail: "We negotiate for you — you pay the best price available.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    detail: "Local experts with deep market knowledge across every corridor.",
  },
  {
    icon: FileText,
    title: "End-to-End Support",
    detail: "From shortlisting to possession and beyond.",
  },
];

const RESOURCES = [
  { icon: Scale, label: "RERA Act — What Every Buyer Should Know", slug: "disclaimer" },
  { icon: FileText, label: "Documents Required for Home Loan", slug: "privacy-policy" },
  { icon: Calculator, label: "Stamp Duty & Registration Charges", href: "/calculators/stamp-duty" },
  { icon: BookOpen, label: "Home Buying Checklist", slug: "calculator-disclaimer" },
];

const TESTIMONIALS = [
  {
    quote:
      "We were shown exactly which listings had a RERA number and which didn't, before we shortlisted anything. No pressure to decide fast.",
    name: "Karan Malhotra",
    role: "Buyer, Golf Course Road",
  },
  {
    quote:
      "The rental yield numbers matched what we actually saw once the property was let out. Useful for comparing localities.",
    name: "Priya Nair",
    role: "Investor, Dwarka Expressway",
  },
];

/**
 * Expanded client-outcome stories per the HD pack's showcase upgrade
 * (sections-hd/09-client-success-stories-expanded.png): homebuyer, NRI and
 * commercial-investor archetypes with a concrete outcome each, using the
 * pack's true-alpha people cutouts.
 */
const OUTCOME_STORIES = [
  {
    photo: "/verticals/realestate/templates/premium-inventory/people/homebuyer-rohit-malhotra.png",
    name: "Rohit Malhotra",
    role: "Homebuyer",
    outcome: "Found a 3 BHK within budget in 3 weeks",
    quote:
      "Transparent process from day one — every listing came with its RERA status and a price benchmark against recent deals.",
  },
  {
    photo: "/verticals/realestate/templates/premium-inventory/people/nri-investor-neha-arora.png",
    name: "Neha Arora",
    role: "NRI Investor",
    outcome: "Closed remotely with video site visits",
    quote:
      "As an NRI I needed ground truth, not brochures. Video walkthroughs and documentation support made the purchase stress-free from abroad.",
  },
  {
    photo: "/verticals/realestate/templates/premium-inventory/people/commercial-investor-vikram-bansal.png",
    name: "Vikram Bansal",
    role: "Commercial Investor",
    outcome: "Pre-leased asset at a strong yield",
    quote:
      "The rental yield numbers were laid out against comparable assets before I committed. The asset has performed to the projection.",
  },
];

export default async function PremiumInventoryHome({ tenant }: { tenant: Tenant }) {
  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [settings, allProperties, localityFacets, localities, updates] = await Promise.all([
    getFirmSettings(tenant.id),
    getProperties(tenant.id, {}),
    getPropertyLocalityFacets(tenant.id),
    getLocalities(tenant.id),
    getPublishedUpdates(tenant.id),
  ]);

  if (!settings) return null;

  const imageEntries = await Promise.all(
    allProperties.map(async (property) => {
      const images = await getPropertyImages(property.id);
      const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
      return [property.id, primary ? { path: primary.path, alt: primary.alt } : undefined] as const;
    }),
  );
  const imageMap = Object.fromEntries(imageEntries);

  const newlyLaunched = allProperties.filter((prop) => prop.status === "new_launch").slice(0, 4);
  const residential = allProperties.filter((prop) => prop.propertyType !== "commercial");
  const commercial = allProperties.filter((prop) => prop.propertyType === "commercial");

  const intentCounts = INTENTS.map((intent) => {
    const count = allProperties.filter((prop) => {
      if (intent.status) return prop.status === intent.status;
      if (intent.minBeds) return (prop.beds ?? 0) >= intent.minBeds;
      if (intent.propertyType) return prop.propertyType === intent.propertyType;
      return false;
    }).length;
    return { ...intent, count };
  });

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy">
        <Image
          src="/verticals/realestate/photos/hero-inventory.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/40 to-navy-deep/80" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-ring">
              Gurugram Real Estate
            </p>
            <h1 className="display-xl mt-3 text-white">Find the right property in Gurugram.</h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
              Premium homes. Prime locations. Trusted experts.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <HeroSearchBar action={p("/properties")} localities={localityFacets} />
          </div>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-tint">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-5 py-7 sm:grid-cols-3 sm:px-6 lg:px-8">
          {TRUST_STRIP.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-surface">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-subtle">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Newly launched ─────────────────────────────────────────────── */}
      {newlyLaunched.length > 0 ? (
        <section className="border-b border-line bg-surface">
          <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display-md">Newly Launched Properties</h2>
              <Link
                href={p("/properties?status=new_launch")}
                className="inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium text-navy hover:text-accent"
              >
                View all launches
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {newlyLaunched.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  href={p(`/properties/${property.slug}`)}
                  imagePath={imageMap[property.id]?.path}
                  imageAlt={imageMap[property.id]?.alt ?? undefined}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Explore properties ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-tint">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <h2 className="display-md text-center">Explore Properties</h2>
          <div className="mt-7">
            <ExploreTabs
              residential={residential}
              commercial={commercial}
              images={imageMap}
              basePath={basePath}
            />
          </div>
        </div>
      </section>

      {/* ── Browse by intent ───────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[12px] border border-line bg-tint p-6 sm:p-8">
            <h2 className="text-center text-[15px] font-semibold text-ink">Browse by Intent</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {intentCounts.map((intent) => {
                const Icon = intent.icon;
                const params = new URLSearchParams();
                if (intent.status) params.set("status", intent.status);
                if (intent.minBeds) params.set("beds", String(intent.minBeds));
                if (intent.propertyType) params.set("type", intent.propertyType);
                return (
                  <Link
                    key={intent.label}
                    href={p(`/properties?${params.toString()}`)}
                    className="flex flex-col items-center rounded-[10px] bg-surface p-4 text-center transition-shadow hover:shadow-[0_2px_6px_rgba(15,44,82,0.06)]"
                  >
                    <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-2.5 text-[13px] font-medium text-ink">{intent.label}</p>
                    <p className="mt-0.5 text-[11px] text-ink-subtle">{intent.count} properties</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Corridors ──────────────────────────────────────────────────── */}
      {localities.length > 0 ? (
        <section className="border-b border-line bg-tint">
          <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display-md">Explore Gurugram Corridors</h2>
              <Link
                href={p("/localities")}
                className="inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium text-navy hover:text-accent"
              >
                All Localities
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {localities.slice(0, 5).map((locality) => (
                <LocalityCard key={locality.id} locality={locality} href={p(`/localities/${locality.slug}`)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Why us ─────────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <h2 className="display-md text-center">Why {settings.firmName}?</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-start gap-2.5 rounded-[10px] border border-line p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-soft">
                    <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  </span>
                  <p className="text-[13.5px] font-semibold text-ink">{item.title}</p>
                  <p className="text-[12px] leading-relaxed text-ink-subtle">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Top developers (expanded network per HD pack section 07) ──── */}
      <section className="border-b border-line bg-tint">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <h2 className="display-md text-center">Top Developers in Gurugram</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[14px] text-ink-muted">
            We work directly with Gurugram&rsquo;s leading developers.
          </p>
          <div className="mt-7">
            <DeveloperLogos logos={DEVELOPER_LOGOS} />
          </div>
        </div>
      </section>

      {/* ── Client outcomes (expanded stories per HD pack section 09) ─── */}
      {settings.reviewsEnabled ? (
        <section className="border-b border-line bg-surface">
          <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
            <h2 className="display-md text-center">Client Outcomes</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {OUTCOME_STORIES.map((story) => (
                <figure key={story.name} className="flex flex-col rounded-[12px] border border-line bg-tint p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface">
                      <Image
                        src={story.photo}
                        alt={story.name}
                        fill
                        sizes="64px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink">{story.name}</p>
                      <p className="text-[11.5px] text-ink-subtle">{story.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-[12.5px] font-semibold text-accent">{story.outcome}</p>
                  <blockquote className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-muted">
                    &ldquo;{story.quote}&rdquo;
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Personalised recommendations CTA ──────────────────────────── */}
      <section className="bg-navy">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="display-lg text-white">Personalised Recommendations From Gurugram Experts</h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/70">
              Share your needs and get a curated shortlist with a site-visit plan.
            </p>
            <Link
              href={p("/contact")}
              className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-[8px] bg-accent px-5 text-[14px] font-medium text-white hover:bg-accent-hover"
            >
              Get My Shortlist
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px]">
            <Image
              src="/verticals/realestate/photos/hero-advisory.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials / insights / resources ───────────────────────── */}
      <section className="border-b border-line bg-tint">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {settings.reviewsEnabled && TESTIMONIALS.length > 0 ? (
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Customer Success Stories</h3>
              <div className="mt-4 space-y-4">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} className="rounded-[10px] border border-line bg-surface p-4">
                    <p className="text-[13px] leading-relaxed text-ink-muted">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-3 text-[12px] font-medium text-ink">{t.name}</p>
                    <p className="text-[11px] text-ink-subtle">{t.role}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {updates.length > 0 ? (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Latest Market Insights</h3>
                <Link
                  href={p("/updates")}
                  className="inline-flex min-h-[24px] items-center py-1 text-[12px] font-medium text-navy hover:text-accent"
                >
                  View all
                </Link>
              </div>
              <ul className="mt-2 space-y-1">
                {updates.slice(0, 3).map((update) => (
                  <li key={update.id}>
                    <Link
                      href={p(`/updates/${update.slug}`)}
                      className="block min-h-[24px] py-2 text-[13px] leading-snug text-ink-muted hover:text-navy"
                    >
                      {update.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="text-[15px] font-semibold text-ink">RERA &amp; Buyer Resources</h3>
            <ul className="mt-2 space-y-1">
              {RESOURCES.map((resource) => {
                const Icon = resource.icon;
                return (
                  <li key={resource.label}>
                    <Link
                      href={resource.href ? p(resource.href) : p(`/legal/${resource.slug}`)}
                      className="flex min-h-[24px] items-start gap-2.5 py-2 text-[13px] leading-snug text-ink-muted hover:text-navy"
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                      {resource.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={p("/calculators")}
              className="mt-5 inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] bg-navy px-4 text-[12.5px] font-medium text-white hover:bg-navy-soft"
            >
              View All Resources
            </Link>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <section className="bg-tint-deep">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-5 py-12 text-center sm:px-6 lg:px-8">
          <h2 className="display-lg">Ready to find your perfect property?</h2>
          <p className="max-w-md text-[14px] text-ink-muted">
            Book a free consultation with our Gurugram experts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={p("/contact")}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-[8px] bg-navy px-6 text-[14px] font-medium text-white hover:bg-navy-soft"
            >
              Book Consultation
            </Link>
            {settings.whatsapp ? (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-[8px] border border-line-strong px-6 text-[14px] font-medium text-navy hover:border-navy"
              >
                <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            ) : null}
          </div>
          {settings.phone ? (
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex min-h-[24px] items-center gap-1.5 py-1 text-[13px] text-ink-muted hover:text-navy">
              <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {settings.phone}
            </a>
          ) : null}
        </div>
      </section>
    </>
  );
}
