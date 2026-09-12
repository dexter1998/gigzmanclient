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
  RENTAL_AREAS,
  RENTAL_BUDGETS,
  RENTAL_OCCASIONS,
  RENTAL_QUESTIONS,
  farmRentalEnabled,
  formatBudget,
} from "@/lib/premium-v2/farm-rental";
import RentalEnquiryFormV2 from "@/components/realestate/premium-v2/RentalEnquiryFormV2";
import ListingStripV2 from "@/components/realestate/premium-v2/ListingStripV2";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const HERO = "/verticals/realestate/templates/premium-v2/farmhouses/06-gurgaon-farmhouse.webp";

interface Props {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmRentalEnabled(tenant.slug)) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Farmhouse on Rent near Delhi NCR & Gurgaon | ${settings?.firmName ?? ""}`,
    description:
      "Farmhouses in the Sohna belt on rent for parties, weddings, day outings, shoots and overnight stays — what each occasion costs here, what the rate includes, and how to check a date.",
    alternates: { canonical: joinPath(basePathFor(tenant), "/farmhouse-rental") },
  };
}

export default async function FarmhouseRentalHubPage(props: Props) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmRentalEnabled(tenant.slug)) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Farmhouse on Rent", url: p("/farmhouse-rental") },
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
            <span className="text-white/85">Farmhouse on Rent</span>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">Sohna belt · Delhi NCR</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">
            Farmhouses on rent, an hour from Delhi.
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            Parties, weddings, day outings, shoots and overnight stays across Sohna, Karnki,
            Damdama, Bhondsi and the Westin Vatika estate. We let our own properties and arrange
            bookings on other owners&rsquo; — so if the date you want is taken on one, we can usually
            find it on another. Every page below says what that occasion actually costs in this
            belt, and what the quoted rate usually leaves out.
          </p>
        </div>
      </section>

      {/* ── By occasion ──────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>What is it for</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Start with the occasion
          </h2>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
            A wedding and a day outing need almost nothing in common from the same property. Pick
            the one you are planning — the page covers the group size it suits, the day rate this
            belt charges for it, and the questions worth asking before you pay a token.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RENTAL_OCCASIONS.map((occasion) => (
              <Link
                key={occasion.slug}
                href={p(`/farmhouse-rental/${occasion.slug}`)}
                className="group flex flex-col overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={occasion.photo}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[17px] text-[color:var(--gp-ink)]">
                    Farmhouse for {occasion.label.toLowerCase()}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] text-[color:var(--gp-muted)]">
                    {occasion.capacity} · {formatBudget(occasion.budget[0])}–
                    {formatBudget(occasion.budget[1])} a day
                  </p>
                  <span className="mt-auto flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-[color:var(--gp-gold-600)]">
                    Read the guide
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </GpContainer>
      </GpSection>

      <ListingStripV2
        clientId={tenant.id}
        basePath={basePath}
        eyebrow="On the belt right now"
        heading="Properties currently listed with us"
        blurb="Letting availability changes weekly. These are the properties we are working on at the moment — tell us your date and we will say which of them is free."
        limit={3}
      />

      {/* ── By area ──────────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <GpEyebrow>Where</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
                Pick the pocket
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                Every pocket in the belt is within an hour of the others, so the choice is really
                about drive time for your guests and how remote you want the day to feel.
              </p>

              <ul className="mt-7 space-y-4">
                {RENTAL_AREAS.map((area) => (
                  <li key={area.slug} className="border-t border-[color:var(--gp-border)] pt-4">
                    <p className="font-display text-[15.5px] text-[color:var(--gp-ink)]">
                      {area.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--gp-muted)]">
                      {area.access}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {RENTAL_OCCASIONS.slice(0, 4).map((occasion) => (
                        <Link
                          key={occasion.slug}
                          href={p(`/farmhouse-rental/${occasion.slug}-in-${area.slug}`)}
                          className="text-[12.5px] font-medium text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
                        >
                          {occasion.label}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <RentalEnquiryFormV2
                occasions={RENTAL_OCCASIONS.map((o) => ({ slug: o.slug, label: o.label }))}
                areas={RENTAL_AREAS.map((a) => ({ slug: a.slug, name: a.name }))}
                thankYouHref={p("/thank-you")}
              />
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* ── Budget + questions ───────────────────────────────────────── */}
      <GpSection tone="forest">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">By budget</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-white">
                Working to a number
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">
                Day rates in this belt start around ₹6,000 and run past ₹5 lakh for a wedding
                weekend. These pages set out what each budget realistically gets you.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {RENTAL_BUDGETS.map((budget) => (
                  <Link
                    key={budget}
                    href={p(`/farmhouse-rental/under-${budget}`)}
                    className="inline-flex min-h-[42px] items-center rounded-full border border-white/30 px-4 text-[13px] font-medium text-white transition-colors hover:border-[color:var(--gp-gold-300)] hover:text-[color:var(--gp-gold-300)]"
                  >
                    Under {formatBudget(budget)}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">Before you book</GpEyebrow>
              <h2 className="gp-section-title font-display mt-2 text-white">
                The questions people ask us
              </h2>
              <ul className="mt-6 space-y-3">
                {RENTAL_QUESTIONS.map((question) => (
                  <li key={question.slug} className="border-t border-white/15 pt-3">
                    <Link
                      href={p(`/farmhouse-rental/${question.slug}`)}
                      className="flex items-start justify-between gap-4 text-[14.5px] leading-relaxed text-white/85 hover:text-[color:var(--gp-gold-300)]"
                    >
                      {question.title}
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
