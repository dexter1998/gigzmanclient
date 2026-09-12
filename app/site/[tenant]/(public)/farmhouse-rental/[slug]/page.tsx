import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  RENTAL_AREAS,
  RENTAL_OCCASIONS,
  allRentalSlugs,
  areaBySlug,
  budgetFromSlug,
  farmRentalEnabled,
  formatBudget,
  occasionBySlug,
  parseOccasionAreaSlug,
  questionBySlug,
  type RentalArea,
  type RentalFaq,
  type RentalOccasion,
} from "@/lib/premium-v2/farm-rental";
import RentalEnquiryFormV2 from "@/components/realestate/premium-v2/RentalEnquiryFormV2";
import ListingStripV2 from "@/components/realestate/premium-v2/ListingStripV2";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    farmRentalEnabled(tenant.slug) ? allRentalSlugs().map((slug) => ({ slug })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

/**
 * One route serves four page shapes, because they share a layout and differ
 * only in where the copy comes from:
 *
 *   party                → the occasion across the whole belt
 *   party-in-sohna       → that occasion in one pocket
 *   under-25000          → a budget band
 *   how-much-does-…      → a hand-written question page
 *
 * Splitting them into four route folders would mean four copies of the same
 * hero, form and listing strip.
 */
type Resolved =
  | { kind: "occasion"; occasion: RentalOccasion; area?: RentalArea }
  | { kind: "budget"; budget: number }
  | { kind: "question"; question: NonNullable<ReturnType<typeof questionBySlug>> };

function resolve(slug: string): Resolved | null {
  const question = questionBySlug(slug);
  if (question) return { kind: "question", question };

  const budget = budgetFromSlug(slug);
  if (budget) return { kind: "budget", budget };

  const pair = parseOccasionAreaSlug(slug);
  if (pair) return { kind: "occasion", occasion: pair.occasion, area: pair.area };

  const occasion = occasionBySlug(slug);
  if (occasion) return { kind: "occasion", occasion };

  return null;
}

function titleFor(r: Resolved): string {
  if (r.kind === "question") return r.question.title;
  if (r.kind === "budget") return `Farmhouse on rent under ${formatBudget(r.budget)} near Gurgaon`;
  const where = r.area ? ` in ${r.area.name}` : " near Delhi NCR";
  return `Farmhouse for ${r.occasion.label.toLowerCase()}${where}`;
}

function descriptionFor(r: Resolved): string {
  if (r.kind === "question") return r.question.intro.slice(0, 180);
  if (r.kind === "budget")
    return `What ${formatBudget(r.budget)} a day actually gets you in the Sohna farm belt — property size, guest count, and what the rate leaves out.`;
  const where = r.area ? r.area.name : "the Sohna belt";
  return `Renting a farmhouse for ${r.occasion.phrase} in ${where} — ${r.occasion.capacity}, day rates from ${formatBudget(r.occasion.budget[0])}, and the questions to ask before you pay a token.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmRentalEnabled(tenant.slug)) return {};
  const r = resolve(slug);
  if (!r) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `${titleFor(r)} | ${settings?.firmName ?? ""}`,
    description: descriptionFor(r),
    alternates: { canonical: joinPath(basePathFor(tenant), `/farmhouse-rental/${slug}`) },
  };
}

/** FAQs for the generated shapes, built from the axis rather than written. */
function faqsFor(r: Resolved): RentalFaq[] {
  if (r.kind === "question") return r.question.faqs;

  if (r.kind === "budget") {
    return [
      {
        q: `What does ${formatBudget(r.budget)} a day get in this belt?`,
        a:
          r.budget <= 10000
            ? "A modest property or a day-only slot on a bigger one, usually on a weekday, lawn access only and often without the pool. Good for a picnic or a small get-together."
            : r.budget <= 25000
              ? "A one-acre property with a lawn and usually a pool, for a day booking with 30 to 80 guests. Weekdays comfortably; a Saturday in season, only at the lower end of the quality range."
              : r.budget <= 50000
                ? "A well-kept one-acre property for a day event of up to about 150 guests, or an overnight stay for a smaller group. Pool and indoor rooms generally included at this level."
                : r.budget <= 100000
                  ? "A large or well-appointed property, an overnight booking with rooms, or a full day with substantial guest numbers. This is where the Westin estate properties start."
                  : "A wedding-grade booking — multiple acres, rooms for the family, and the setup and teardown days that a wedding needs.",
      },
      {
        q: "Is that the final price?",
        a: "Almost never. Add the security deposit, generator running charges, cleaning beyond the stated hours, and staff for guest numbers above what was agreed. Ask for the rate and the exclusions in the same message.",
      },
      {
        q: "Does the day of the week change it?",
        a: "Substantially. A Saturday in wedding season can be three times the same property on a Tuesday in July.",
      },
    ];
  }

  const { occasion, area } = r;
  const where = area ? area.name : "the Sohna belt";
  return [
    {
      q: `What does a farmhouse for ${occasion.phrase} cost in ${where}?`,
      a: `Day rates for ${occasion.phrase} here run roughly ${formatBudget(occasion.budget[0])} to ${formatBudget(occasion.budget[1])}, depending on the day of the week, the guest count and how well kept the property is. Season and Saturdays sit at the top of that range.`,
    },
    {
      q: "How many guests can we bring?",
      a: `${occasion.capacity} is the usual range for ${occasion.phrase} on a one-acre property in this belt. Above that the limit is rarely the lawn — it is parking, washrooms and the generator.`,
    },
    {
      q: occasion.overnight ? "Can we stay overnight?" : "What are the timings?",
      a: occasion.overnight
        ? "Yes — properties in this belt let overnight for this. Confirm air-conditioning, hot water, linen and whether a caretaker stays on the property, because those are the three things most often missing."
        : "Day bookings usually run about 10am to 7pm. Confirm the in and out times in writing, and what it costs if you run over, before you pay a token.",
    },
    {
      q: "How far is it from Delhi?",
      a: area
        ? area.access
        : "Roughly an hour from South Delhi and forty minutes from Cyber City on the Sohna elevated road.",
    },
  ];
}

export default async function FarmhouseRentalPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmRentalEnabled(tenant.slug)) notFound();

  const r = resolve(slug);
  if (!r) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const heading = titleFor(r);
  const faqs = faqsFor(r);
  const photo =
    r.kind === "question"
      ? r.question.photo
      : r.kind === "budget"
        ? `${FARM}/${String((r.budget / 10000) % 30 || 5).padStart(2, "0")}-gurgaon-farmhouse.webp`
        : r.occasion.photo;

  const localityFilter = r.kind === "occasion" ? r.area?.locality : undefined;

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Farmhouse on Rent", url: p("/farmhouse-rental") },
            { name: heading, url: p(`/farmhouse-rental/${slug}`) },
          ]),
        )}
      />
      <script {...jsonLdProps(buildFaqJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a }))))} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={photo} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-14 pt-12 lg:pb-18 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/farmhouse-rental")} className="hover:text-[color:var(--gp-gold-300)]">
              Farmhouse on Rent
            </Link>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">
            {r.kind === "question"
              ? "Before you book"
              : r.kind === "budget"
                ? "By budget"
                : r.area
                  ? `${r.area.name} · Sohna belt`
                  : "Sohna belt · Delhi NCR"}
          </GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">
            {r.kind === "question" ? r.question.heading : heading}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            {r.kind === "question"
              ? r.question.intro
              : r.kind === "budget"
                ? `What ${formatBudget(r.budget)} a day realistically gets you in the Sohna farm belt — and what still sits outside it.`
                : r.occasion.intro}
          </p>

          {r.kind === "occasion" ? (
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/15 pt-7">
              <div>
                <dt className="text-[11.5px] uppercase tracking-[0.09em] text-white/55">
                  Usual group size
                </dt>
                <dd className="font-sans mt-1 text-[20px] font-semibold text-[color:var(--gp-gold-300)]">
                  {r.occasion.capacity}
                </dd>
              </div>
              <div>
                <dt className="text-[11.5px] uppercase tracking-[0.09em] text-white/55">
                  Day rate in this belt
                </dt>
                <dd className="font-sans mt-1 text-[20px] font-semibold text-[color:var(--gp-gold-300)]">
                  {formatBudget(r.occasion.budget[0])} – {formatBudget(r.occasion.budget[1])}
                </dd>
              </div>
              <div>
                <dt className="text-[11.5px] uppercase tracking-[0.09em] text-white/55">
                  Overnight
                </dt>
                <dd className="font-sans mt-1 text-[20px] font-semibold text-[color:var(--gp-gold-300)]">
                  {r.occasion.overnight ? "Usually" : "Day booking"}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      {/* ── Body + form ──────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <div>
              {r.kind === "question" ? (
                <div className="space-y-9">
                  {r.question.body.map((block) => (
                    <div key={block.heading}>
                      <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                        {block.heading}
                      </h2>
                      {block.paragraphs.map((para) => (
                        <p
                          key={para.slice(0, 40)}
                          className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : r.kind === "budget" ? (
                <div className="space-y-9">
                  <div>
                    <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                      Which occasions fit this budget
                    </h2>
                    <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                      A budget is only useful next to what you are planning. These are the occasions
                      whose usual day rate in this belt sits at or below {formatBudget(r.budget)}.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      {RENTAL_OCCASIONS.filter((o) => o.budget[0] <= r.budget).map((o) => (
                        <Link
                          key={o.slug}
                          href={p(`/farmhouse-rental/${o.slug}`)}
                          className="inline-flex min-h-[40px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[13px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                        >
                          {o.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                      Where the budget stretches furthest
                    </h2>
                    <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                      The same money buys a noticeably better property the further into the belt you
                      go. Bhondsi and Sohna Road are the shortest drives and the most expensive for
                      what you get; Damdama and the village pockets around Karnki are the other way
                      round.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-9">
                  <div>
                    <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                      What {r.occasion.phrase} actually needs from the property
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {r.occasion.needs.map((need) => (
                        <li key={need} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]"
                            aria-hidden="true"
                          />
                          <span className="text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                            {need}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {r.area ? (
                    <div>
                      <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                        {r.area.name}, specifically
                      </h2>
                      <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                        {r.area.character}
                      </p>
                      <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                        {r.area.access}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                        Which pocket suits it
                      </h2>
                      <ul className="mt-4 space-y-3">
                        {RENTAL_AREAS.slice(0, 6).map((area) => (
                          <li key={area.slug} className="border-t border-[color:var(--gp-border)] pt-3">
                            <Link
                              href={p(`/farmhouse-rental/${r.occasion.slug}-in-${area.slug}`)}
                              className="font-display text-[15.5px] text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                            >
                              {r.occasion.label} in {area.name}
                            </Link>
                            <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--gp-muted)]">
                              {area.character}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
                      What the quoted rate usually leaves out
                    </h2>
                    <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                      A refundable security deposit, generator running charges billed by the hour,
                      cleaning if the booking runs past the stated hours, extra staff above the
                      agreed guest count, and — on an overnight booking — air-conditioning charged
                      per room. Ask for the rate and the exclusions in the same message, in writing.
                    </p>
                    <Link
                      href={p("/farmhouse-rental/what-is-included-when-you-rent-a-farmhouse")}
                      className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
                    >
                      The full included / excluded list
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}

              {/* ── FAQ ──────────────────────────────────────────────── */}
              <div className="mt-12 border-t border-[color:var(--gp-border)] pt-8">
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
              <RentalEnquiryFormV2
                occasions={RENTAL_OCCASIONS.map((o) => ({ slug: o.slug, label: o.label }))}
                defaultOccasion={r.kind === "occasion" ? r.occasion.slug : undefined}
                areas={RENTAL_AREAS.map((a) => ({ slug: a.slug, name: a.name }))}
                defaultArea={r.kind === "occasion" ? r.area?.slug : undefined}
                thankYouHref={p("/thank-you")}
                heading={
                  r.kind === "occasion"
                    ? `Check a date for ${r.occasion.label.toLowerCase()}`
                    : "Check a date"
                }
              />
            </div>
          </div>
        </GpContainer>
      </GpSection>

      <ListingStripV2
        clientId={tenant.id}
        basePath={basePath}
        eyebrow={r.kind === "occasion" && r.area ? r.area.name : "On the belt"}
        heading="Properties we are working on right now"
        blurb="Listed for sale, and several of them let out through us as well. Tell us the date and we will say which are free."
        locality={localityFilter}
        limit={3}
        tone="forest"
      />

      {/* ── Related ──────────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <GpEyebrow>Keep reading</GpEyebrow>
          <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
            Related pages
          </h2>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {RENTAL_OCCASIONS.filter((o) => !(r.kind === "occasion" && o.slug === r.occasion.slug))
              .slice(0, 6)
              .map((o) => (
                <Link
                  key={o.slug}
                  href={p(
                    r.kind === "occasion" && r.area
                      ? `/farmhouse-rental/${o.slug}-in-${r.area.slug}`
                      : `/farmhouse-rental/${o.slug}`,
                  )}
                  className="inline-flex min-h-[42px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[13px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                >
                  Farmhouse for {o.label.toLowerCase()}
                  {r.kind === "occasion" && r.area ? ` in ${r.area.name}` : ""}
                </Link>
              ))}
            <Link
              href={p("/farmhouse-rental")}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-900)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              All rental guides
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
