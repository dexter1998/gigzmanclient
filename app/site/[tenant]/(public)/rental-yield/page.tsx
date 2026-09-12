import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings, getLocalities } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";
import { formatInr } from "@/lib/format";
import RentalYieldCalculatorV2 from "@/components/realestate/premium-v2/tools/RentalYieldCalculatorV2";
import { ArrowRight } from "lucide-react";
import {
  RENTAL_AREAS,
  RENTAL_OCCASIONS,
  RENTAL_QUESTIONS,
  farmRentalEnabled,
  formatBudget,
} from "@/lib/premium-v2/farm-rental";
import { GpContainer, GpEyebrow, GpSection } from "@/components/realestate/premium-v2/gp-primitives";

interface Props {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `How Long Until Your Gurugram Property Pays for Itself? | ${settings?.firmName ?? ""}`,
    description:
      "Work out rental yield and payback years for a Gurugram property — floor by floor, counting vacancy and appreciation, not just a single rent figure.",
    alternates: { canonical: joinPath(basePathFor(tenant), "/rental-yield") },
  };
}

export default async function RentalYieldHubPage(props: Props) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  const settings = await getFirmSettings(tenant.id);

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const localities = await getLocalities(tenant.id);
  const priced = localities.filter((l) => l.rentalYieldPercent && l.avgPricePerSqft);

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Rental Yield", url: p("/rental-yield") },
          ]),
        )}
      />

      <RentalYieldCalculatorV2
        heading="How long until your property pays for itself?"
        subheading="Most yield calculators stop at a percentage. This one asks how many floors you actually let, what each earns, and how long the building takes to return what it cost."
        initialValue={20000000}
        initialAppreciation={8}
        breadcrumb={
          <nav aria-label="Breadcrumb" className="text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/85">Rental Yield</span>
          </nav>
        }
      />

      {/* Between the calculator and the page's closing CTA.

          On a farm-land tenant the corridor table below never renders — the
          locality rows carry no rental-yield figure — so the page went from
          its calculator straight to the footer CTA with nothing in between.
          It is also the wrong question for this audience: almost nobody in
          this belt lets a farmhouse on an annual tenancy, they let it by the
          day for an event, and that is what the search demand asks about. */}
      {farmRentalEnabled(tenant.slug) ? (
        <GpSection tone="cream">
          <GpContainer>
            <GpEyebrow>Letting by the day, not the year</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 max-w-2xl text-[color:var(--gp-ink)]">
              What a farmhouse in this belt actually earns
            </h2>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              A farmhouse here does not let on an annual tenancy. It lets by the day — a party, a
              wedding, a shoot, a weekend — and a well-run one-acre property in a good pocket does
              roughly six to ten days a month across the year, heavily concentrated between October
              and March. These pages set out what each occasion pays and what it costs to deliver.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RENTAL_OCCASIONS.slice(0, 6).map((occasion) => (
                <Link
                  key={occasion.slug}
                  href={p(`/farmhouse-rental/${occasion.slug}`)}
                  className="group flex flex-col rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5 transition-colors hover:border-[color:var(--gp-gold-600)]"
                >
                  <h3 className="font-display text-[16px] text-[color:var(--gp-ink)]">
                    {occasion.label}
                  </h3>
                  <p className="mt-1.5 font-sans text-[18px] font-semibold text-[color:var(--gp-gold-600)]">
                    {formatBudget(occasion.budget[0])} – {formatBudget(occasion.budget[1])}
                    <span className="ml-1 text-[12px] font-medium text-[color:var(--gp-muted)]">
                      a day
                    </span>
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-muted)]">
                    {occasion.capacity} · {occasion.overnight ? "Usually overnight" : "Day booking"}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-9 grid grid-cols-1 gap-8 border-t border-[color:var(--gp-border)] pt-8 lg:grid-cols-2">
              <div>
                <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">By pocket</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {RENTAL_AREAS.map((area) => (
                    <Link
                      key={area.slug}
                      href={p(`/farmhouse-rental/party-in-${area.slug}`)}
                      className="inline-flex min-h-[38px] items-center rounded-full border border-[color:var(--gp-border)] bg-white px-3.5 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">Before you let it out</p>
                <ul className="mt-3 space-y-2">
                  {RENTAL_QUESTIONS.slice(0, 4).map((question) => (
                    <li key={question.slug}>
                      <Link
                        href={p(`/farmhouse-rental/${question.slug}`)}
                        className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)] hover:text-[color:var(--gp-gold-600)]"
                      >
                        <ArrowRight
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-[color:var(--gp-gold-600)]"
                          aria-hidden="true"
                        />
                        {question.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href={p("/farmhouse-rental")}
              className="mt-9 inline-flex min-h-[50px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-forest-900)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              All farmhouse rental guides
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </GpContainer>
        </GpSection>
      ) : null}

      {priced.length > 0 ? (
        <GpSection tone="cream">
          <GpContainer>
            <GpEyebrow>Corridor by corridor</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Where rent pays back fastest in Gurugram
            </h2>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              Gurugram yields are low by national standards, so rent alone takes decades. The
              corridors that look best on rent are rarely the ones that have appreciated fastest —
              both columns are shown so the trade-off is visible.
            </p>

            <div className="mt-8 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
              <table className="w-full min-w-[620px] text-[14px]">
                <thead>
                  <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                    <th className="px-4 py-3 font-semibold">Corridor</th>
                    <th className="px-4 py-3 font-semibold">Avg. rate</th>
                    <th className="px-4 py-3 font-semibold">Gross yield</th>
                    <th className="px-4 py-3 font-semibold">Payback on rent</th>
                    <th className="px-4 py-3 font-semibold">With appreciation</th>
                  </tr>
                </thead>
                <tbody>
                  {priced.map((l) => {
                    const gy = l.rentalYieldPercent ?? 0;
                    const yoy = l.yoyChangePercent ?? 0;
                    const rentOnly = gy > 0 ? 100 / gy : null;
                    const combined = gy + yoy > 0 ? 100 / (gy * 0.9 + yoy) : null;
                    return (
                      <tr key={l.id} className="border-t border-[color:var(--gp-border)]">
                        <td className="px-4 py-2.5">
                          <Link
                            href={p(`/rental-yield/${l.slug}`)}
                            className="font-medium text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                          >
                            {l.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                          {formatInr(l.avgPricePerSqft ?? 0)}/sq.ft
                        </td>
                        <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{gy.toFixed(1)}%</td>
                        <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                          {rentOnly ? `${Math.round(rentOnly)} yrs` : "—"}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-[color:var(--gp-gold-600)]">
                          {combined ? `${Math.round(combined)} yrs` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-[color:var(--gp-muted)]">
              Corridor rates and yields are our own working estimates pending independent
              verification, not certified valuations.
            </p>
          </GpContainer>
        </GpSection>
      ) : null}

    </>
  );
}
