import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Scale,
  LifeBuoy,
  Home as HomeIcon,
  Tag,
  KeyRound,
  TrendingUp,
  Check,
  Phone,
  MessageCircle,
  MapPin,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import FaqAccordion from "@/components/site/FaqAccordion";
import PropertyCard from "../PropertyCard";
import LocalityCard from "../LocalityCard";
import ShortlistForm from "../ShortlistForm";
import ValuationForm from "../ValuationForm";
import { Band, SectionTitle, FeatureItem, DeveloperLogos, DEVELOPER_LOGOS } from "../sections/shared";
import { getBasePath, joinPath, type Tenant } from "@/lib/tenant";
import {
  getFirmSettings,
  getTeam,
  getProperties,
  getPropertyImages,
  getPropertyLocalityFacets,
  getLocalities,
} from "@/lib/content";
import { formatIndianPrice } from "@/lib/format";

/**
 * Template 2 — Luxury Advisory.
 * Reference: ~/Downloads/high-properties-4-template-hd/02-luxury-advisory/
 *
 * Trust-led advisory lead generation, not inventory browsing: the hero is a
 * shortlist-intent form beside a consultation photograph, and the page is
 * ordered promise -> services -> picks -> process -> named advisors -> due
 * diligence -> proof -> FAQ. Deliberately a different anatomy from the
 * Premium Inventory template, which leads with search and inventory grids.
 */

const PROMISES = [
  { icon: ShieldCheck, title: "Independent Advice", detail: "We are not tied to any builder or project." },
  { icon: BadgeCheck, title: "Verified Properties", detail: "Every listing is legally and financially verified." },
  { icon: Scale, title: "Best Price, Always", detail: "We negotiate the best value on your behalf." },
  { icon: LifeBuoy, title: "End-to-End Support", detail: "From shortlist to possession and beyond." },
];

const SERVICES = [
  {
    icon: HomeIcon,
    title: "Buy",
    detail: "Find the right home that fits your lifestyle and budget. We shortlist, verify and negotiate for you.",
    cta: "Explore Buying",
    href: "/properties?purpose=buy",
  },
  {
    icon: Tag,
    title: "Sell",
    detail: "Get the best price with our data-driven pricing, marketing and negotiation expertise.",
    cta: "Explore Selling",
    href: "/contact?intent=sell",
  },
  {
    icon: KeyRound,
    title: "Lease",
    detail: "Residential or commercial leasing solutions with verified tenants and paperwork support.",
    cta: "Explore Leasing",
    href: "/properties?purpose=rent",
  },
  {
    icon: TrendingUp,
    title: "Invest",
    detail: "Build wealth with high-potential assets and actionable market insights.",
    cta: "Explore Investing",
    href: "/localities",
  },
];

const PROCESS = [
  { step: "Understand", detail: "We listen to your goals, budget and preferences." },
  { step: "Research", detail: "We analyse options and shortlist verified properties." },
  { step: "Visit", detail: "We arrange visits and provide honest, on-ground insights." },
  { step: "Negotiate", detail: "We negotiate the best terms and handle the paperwork." },
];

const DUE_DILIGENCE = [
  "Title & Ownership Verification",
  "RERA & Project Approvals Check",
  "Financial & Builder Background Check",
  "Property Valuation & Price Benchmarking",
  "Agreement & Documentation Support",
];

const ADVISOR_PHOTOS = [
  "/verticals/realestate/templates/luxury-advisory/people/advisor-arjun-mehta.png",
  "/verticals/realestate/templates/luxury-advisory/people/advisor-neha-rao.png",
  "/verticals/realestate/templates/luxury-advisory/people/advisor-rahul-sen.png",
  "/verticals/realestate/templates/luxury-advisory/people/advisor-isha-kapoor.png",
];

const FAQS = [
  {
    question: "How do I book a consultation?",
    answer:
      "Use the enquiry form or WhatsApp. An advisor will get back the same working day to understand your requirement before any property is suggested.",
  },
  {
    question: "Is your service free for buyers?",
    answer:
      "Advisory and shortlisting are free for buyers. Brokerage, where applicable, is disclosed in writing before any transaction proceeds.",
  },
  {
    question: "Do you charge for property shortlisting?",
    answer: "No. Shortlisting, site visits and price benchmarking are part of the advisory service.",
  },
  {
    question: "How do you ensure price transparency?",
    answer:
      "Every recommendation comes with recent comparable transactions from the same micro-market, so you can see how the asking price sits against actual deals.",
  },
  {
    question: "Can you help with home loans?",
    answer:
      "We can introduce you to lenders and help assemble documentation. We are not a lender and do not receive a commission for referrals.",
  },
  {
    question: "Do you assist NRIs?",
    answer:
      "Yes. We handle remote site visits, video walkthroughs, documentation and power-of-attorney coordination for buyers based outside India.",
  },
];

export default async function LuxuryAdvisoryHome({ tenant }: { tenant: Tenant }) {
  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [settings, team, allProperties, localityFacets, localities] = await Promise.all([
    getFirmSettings(tenant.id),
    getTeam(tenant.id),
    getProperties(tenant.id, {}),
    getPropertyLocalityFacets(tenant.id),
    getLocalities(tenant.id),
  ]);
  if (!settings) return null;

  const picks = allProperties.slice(0, 4);
  const imageEntries = await Promise.all(
    picks.map(async (property) => {
      const images = await getPropertyImages(property.id);
      const primary = images.find((i) => i.isPrimary) ?? images[0] ?? null;
      return [property.id, primary ? { path: primary.path, alt: primary.alt } : undefined] as const;
    }),
  );
  const imageMap = Object.fromEntries(imageEntries);

  // Illustrative recent transactions. Figures are demo content, consistent
  // with the rest of this tenant's seeded data.
  const recentDeals = allProperties.slice(0, 3).map((prop) => ({
    id: prop.id,
    locality: prop.locality ?? "Gurugram",
    config: prop.beds ? `${prop.beds} BHK ${prop.propertyType === "commercial" ? "Office" : "Apartment"}` : "Property",
    price: prop.price,
  }));

  return (
    <>
      {/* ── Hero + shortlist form ─────────────────────────────────────── */}
      <section className="bg-tint">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:px-8">
          <div>
            <h1 className="display-xl">Gurugram property decisions, made with clarity.</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted sm:text-base">
              Independent advice. Verified properties. Better outcomes.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-line py-6 sm:grid-cols-4">
              {[
                { value: "12+", label: "Years of Experience" },
                { value: "2,500+", label: "Happy Clients" },
                { value: `${allProperties.length}`, label: "Active Listings" },
                { value: "3.6★", label: "Google Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-[22px] font-medium text-navy">{stat.value}</span>
                    <span className="mt-1 block text-[11px] leading-tight text-ink-subtle">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 max-w-md">
              <ShortlistForm action={p("/properties")} whatsapp={settings.whatsapp} localities={localityFacets} />
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] lg:aspect-[5/6]">
            <Image
              src="/verticals/realestate/templates/luxury-advisory/images/hero-luxury-advisory.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Promise ───────────────────────────────────────────────────── */}
      <Band tone="surface">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <h2 className="display-md">Our promise of transparency</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((item) => (
              <FeatureItem key={item.title} {...item} />
            ))}
          </div>
        </div>
      </Band>

      {/* ── How we help ───────────────────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle title="How we help you" align="center" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="flex flex-col rounded-[10px] border border-line bg-surface p-5">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-3 font-display text-[19px] text-ink">{service.title}</p>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{service.detail}</p>
                <Link
                  href={p(service.href)}
                  className="mt-4 inline-flex min-h-[32px] items-center gap-1.5 text-[12.5px] font-medium text-navy hover:text-accent"
                >
                  {service.cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>
      </Band>

      {/* ── Curated advisor picks ─────────────────────────────────────── */}
      {picks.length > 0 ? (
        <Band tone="surface">
          <SectionTitle
            title="Curated advisor picks"
            href={p("/properties")}
            linkLabel="View all recommendations"
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {picks.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={p(`/properties/${property.slug}`)}
                imagePath={imageMap[property.id]?.path}
                imageAlt={imageMap[property.id]?.alt ?? undefined}
              />
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
            {["RERA Registered", "Legal & Title Verified", "Construction Updates", "Price Transparency"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </Band>
      ) : null}

      {/* ── Advisory process ──────────────────────────────────────────── */}
      <Band tone="tint">
        <SectionTitle title="Our advisory process" align="center" />
        <ol className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((item, i) => (
            <li key={item.step} className="text-center">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[14px] font-semibold text-white">
                {i + 1}
              </span>
              <p className="mt-3 text-[14px] font-semibold text-ink">{item.step}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{item.detail}</p>
            </li>
          ))}
        </ol>
      </Band>

      {/* ── Local advisors ────────────────────────────────────────────── */}
      {team.length > 0 ? (
        <Band tone="surface">
          <SectionTitle title="Your local advisors" subtitle="Talk to an expert who knows your area." align="center" />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.slice(0, 4).map((member, i) => (
              <div key={member.id} className="rounded-[10px] border border-line bg-tint p-5 text-center">
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface">
                  <Image
                    src={ADVISOR_PHOTOS[i % ADVISOR_PHOTOS.length]}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
                <p className="mt-3 text-[14px] font-semibold text-ink">{member.name}</p>
                {member.designation ? (
                  <p className="mt-0.5 text-[12px] text-accent">{member.designation}</p>
                ) : null}
                {member.bio ? (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-subtle">{member.bio}</p>
                ) : null}
                <Link
                  href={p(`/contact?advisor=${encodeURIComponent(member.name)}`)}
                  className="mt-3 inline-flex min-h-[34px] items-center rounded-[6px] border border-line-strong px-3 text-[12px] font-medium text-navy hover:border-navy"
                >
                  Book a Call
                </Link>
              </div>
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── Due diligence ─────────────────────────────────────────────── */}
      <Band tone="tint">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="display-md">Due diligence, done right</h2>
            <ul className="mt-5 space-y-2.5">
              {DUE_DILIGENCE.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={p("/contact")}
              className="mt-6 inline-flex min-h-[40px] items-center gap-1.5 text-[13px] font-medium text-navy hover:text-accent"
            >
              View our due diligence process
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[12px]">
            <Image
              src="/verticals/realestate/templates/luxury-advisory/images/due-diligence.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      </Band>

      {/* ── Recent deals + valuation ──────────────────────────────────── */}
      <Band tone="surface">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle title="Recent deals" href={p("/properties")} linkLabel="View all deals" />
            <div className="mt-5 divide-y divide-line rounded-[10px] border border-line">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-medium text-ink">{deal.locality}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-subtle">{deal.config}</p>
                  </div>
                  <p className="shrink-0 font-display text-[15px] font-medium text-accent">
                    {deal.price ? formatIndianPrice(deal.price) : "—"}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-ink-subtle">
              Illustrative transactions from this site&rsquo;s demo inventory, not a record of
              completed deals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <ValuationForm contactHref={p("/contact")} localities={localityFacets} />
            <div className="relative hidden aspect-[3/4] w-[180px] overflow-hidden rounded-[10px] sm:block">
              <Image
                src="/verticals/realestate/templates/luxury-advisory/images/property-valuation.webp"
                alt=""
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Band>

      {/* ── Locality expertise ────────────────────────────────────────── */}
      {localities.length > 0 ? (
        <Band tone="tint">
          <SectionTitle title="Locality expertise" href={p("/localities")} linkLabel="Explore all localities" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {localities.slice(0, 5).map((locality) => (
              <LocalityCard key={locality.id} locality={locality} href={p(`/localities/${locality.slug}`)} />
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── Developer partners + FAQ ──────────────────────────────────── */}
      <Band tone="surface">
        <SectionTitle title="Our trusted developer partners" align="center" />
        <div className="mt-7">
          <DeveloperLogos logos={DEVELOPER_LOGOS} />
        </div>

        <div className="mt-14">
          <SectionTitle title="Frequently asked questions" align="center" />
          <div className="mx-auto mt-6 max-w-3xl">
            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </Band>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <Band tone="navy">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-lg text-white">Let&rsquo;s build your property plan</h2>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/70">
              Book a private consultation with our advisors and make confident real-estate decisions.
            </p>
            {settings.addressLine ? (
              <p className="mt-4 flex items-start gap-2 text-[13px] text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {[settings.addressLine, settings.locality, settings.postalCode].filter(Boolean).join(", ")}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={p("/contact")}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-[6px] bg-accent px-6 text-[14px] font-medium text-white hover:bg-accent-hover"
            >
              Book Free Consultation
            </Link>
            {settings.whatsapp ? (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-[6px] border border-white/25 px-6 text-[14px] font-medium text-white hover:border-white/60"
              >
                <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            ) : null}
            {settings.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-[46px] items-center gap-2 text-[14px] font-medium text-white/80 hover:text-white"
              >
                <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                {settings.phone}
              </a>
            ) : null}
          </div>
        </div>
      </Band>
    </>
  );
}
