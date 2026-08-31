import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  MapPin,
  ShieldCheck,
  Calculator,
  Search,
  Building2,
} from "lucide-react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import CalculatorPicker from "@/components/site/CalculatorPicker";
import Testimonials from "@/components/site/Testimonials";
import PropertyCard from "./PropertyCard";
import LocalityCard from "./LocalityCard";
import SearchBar from "./SearchBar";
import { getBasePath, joinPath, type Tenant } from "@/lib/tenant";
import {
  getFirmSettings,
  getFeaturedProperties,
  getPropertyImages,
  getLocalities,
  getCalculators,
  getPublishedUpdates,
} from "@/lib/content";

const VALUE_PROPS = [
  {
    icon: MapPin,
    title: "Corridor Expertise",
    detail: "Inventory tracked across Gurugram's active growth corridors, not just a listings feed.",
  },
  {
    icon: ShieldCheck,
    title: "RERA Transparency",
    detail: "Every listing shows its registration status clearly — verified or explicitly pending.",
  },
  {
    icon: Calculator,
    title: "Budget First",
    detail: "EMI, stamp duty and rental yield worked out before you commit to a site visit.",
  },
  {
    icon: Building2,
    title: "Verified Inventory",
    detail: "Listings are reviewed for accuracy before they go live on the site.",
  },
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
  {
    quote:
      "Straightforward process from shortlist to site visit. Site-visit slots were confirmed the same day.",
    name: "Arjun Bedi",
    role: "Buyer, New Gurugram",
  },
];

export default async function RealEstateHome({ tenant }: { tenant: Tenant }) {
  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [settings, featured, localities, calculators, updates] = await Promise.all([
    getFirmSettings(tenant.id),
    getFeaturedProperties(tenant.id, 6),
    getLocalities(tenant.id),
    getCalculators(tenant.id),
    getPublishedUpdates(tenant.id),
  ]);

  if (!settings) return null;

  const primaryImages = await Promise.all(
    featured.map(async (property) => {
      const images = await getPropertyImages(property.id);
      return images.find((img) => img.isPrimary) ?? images[0] ?? null;
    }),
  );

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
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="display-xl text-white">
              Find Your Next Address in <span className="display-accent">Gurugram.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
              {settings.overview}
            </p>

            <div className="mt-8 max-w-lg">
              <SearchBar action={p("/properties")} placeholder="Search sector, locality or project…" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={p("/properties")} size="lg" variant="accent">
                Browse Properties
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href={p("/contact")} variant="onNavy" size="lg">
                Talk to an Agent
              </Button>
            </div>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-6 border-t border-white/15 py-7 sm:grid-cols-4 sm:gap-4">
            <li>
              <p className="font-display text-[20px] font-medium text-white">{featured.length}+</p>
              <p className="mt-1 text-[11px] text-white/60">Active Listings</p>
            </li>
            <li>
              <p className="font-display text-[20px] font-medium text-white">{localities.length}</p>
              <p className="mt-1 text-[11px] text-white/60">Localities Tracked</p>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-medium text-white">
                  {settings.firmRegistrationNumber ? "RERA Registered" : "Registration Pending"}
                </p>
                <p className="mt-0.5 text-[11px] text-white/60">Agent status</p>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-medium text-white">Verified Before Listing</p>
                <p className="mt-0.5 text-[11px] text-white/60">Every inventory item</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Why choose us ──────────────────────────────────────────────── */}
      <Section tone="page" size="md" wide>
        <h2 className="display-lg title-rule text-center">Why Buyers Work With Us</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-tint">
                  <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{item.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Featured properties ───────────────────────────────────────── */}
      {featured.length > 0 ? (
        <Section tone="page" size="sm" wide>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display-lg">Featured Properties</h2>
              <p className="mt-2 text-[14px] text-ink-muted">
                A cross-section of current inventory. Every card shows its RERA status.
              </p>
            </div>
            <Link
              href={p("/properties")}
              className="inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium text-navy hover:text-accent"
            >
              View All Properties
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={p(`/properties/${property.slug}`)}
                imagePath={primaryImages[i]?.path}
                imageAlt={primaryImages[i]?.alt ?? undefined}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Localities ─────────────────────────────────────────────────── */}
      {localities.length > 0 ? (
        <Section tone="tint" size="sm" wide>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display-lg">Explore by Locality</h2>
              <p className="mt-2 text-[14px] text-ink-muted">
                Market snapshots for the corridors we track.
              </p>
            </div>
            <Link
              href={p("/localities")}
              className="inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium text-navy hover:text-accent"
            >
              All Localities
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {localities.slice(0, 4).map((locality) => (
              <LocalityCard key={locality.id} locality={locality} href={p(`/localities/${locality.slug}`)} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Calculators ────────────────────────────────────────────────── */}
      {calculators.length > 0 ? (
        <Section tone="page" size="md" wide>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display-lg">Work Out Your Budget</h2>
              <p className="mt-2 text-[14px] text-ink-muted">
                Pick a calculator, enter the key figures, and open the full working.
              </p>
            </div>
            <Link
              href={p("/calculators")}
              className="inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium text-navy hover:text-accent"
            >
              All Calculators
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7">
            <CalculatorPicker
              calculators={calculators.map((c) => ({
                key: c.key,
                title: c.title,
                description: c.description,
                taxYear: c.taxYear,
                version: c.version,
                status: c.status,
              }))}
              calculatorsHref={p("/calculators")}
            />
          </div>
        </Section>
      ) : null}

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      {settings.reviewsEnabled ? (
        <Section tone="tint" size="sm" wide>
          <div>
            <h2 className="display-lg">What Buyers Say</h2>
            <p className="mt-2 text-[14px] text-ink-muted">Experiences shared by buyers and tenants.</p>
          </div>
          <div className="mt-7">
            <Testimonials testimonials={TESTIMONIALS} />
          </div>
        </Section>
      ) : null}

      {/* ── Insights ───────────────────────────────────────────────────── */}
      {updates.length > 0 ? (
        <Section tone="page" size="sm" wide>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display-lg">Market Insights</h2>
              <p className="mt-2 text-[14px] text-ink-muted">Notes on locality trends and market movement.</p>
            </div>
            <Link
              href={p("/updates")}
              className="inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium text-navy hover:text-accent"
            >
              View All Insights
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
            {updates.slice(0, 3).map((update) => (
              <Link
                key={update.id}
                href={p(`/updates/${update.slug}`)}
                className="group overflow-hidden rounded-[12px] border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-ring"
              >
                <div className="p-5">
                  <p className="display-sm leading-snug">{update.title}</p>
                  <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
                    {update.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <Section tone="page" size="md" wide>
        <div className="relative overflow-hidden rounded-[16px] bg-tint-deep px-6 py-11 sm:px-10 sm:py-14">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="display-lg">
                Ready to find your <span className="display-accent">property?</span>
              </h2>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-ink-muted">
                Share your requirement — locality, budget and configuration — and the team will
                shortlist matching inventory.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Button href={p("/contact")} variant="accent" size="lg">
                  Enquire Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                {settings.phone ? (
                  <span className="flex items-center gap-2 text-[14px] text-ink-muted">
                    or
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, "")}`}
                      className="inline-flex min-h-[38px] items-center gap-1.5 py-1 font-medium text-navy hover:text-accent"
                    >
                      <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {settings.phone}
                    </a>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[380px] overflow-hidden rounded-[12px] lg:block">
              <Image
                src="/verticals/realestate/photos/cta-recommendation.webp"
                alt=""
                fill
                sizes="380px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
