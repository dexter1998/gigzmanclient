import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  PINCODES,
  acres,
  aggregate,
  crore,
  farmSearchEnabled,
  perSqft,
} from "@/lib/premium-v2/farm-search";
import PremiumV2EnquiryForm from "@/components/realestate/premium-v2/PremiumV2EnquiryForm";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    farmSearchEnabled(tenant.slug) ? PINCODES.map((pin) => ({ code: pin.code })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; code: string }>;
}

const pinByCode = (code: string) => PINCODES.find((p) => p.code === code);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, code } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !farmSearchEnabled(tenant.slug)) return {};
  const pin = pinByCode(code);
  if (!pin) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `${code} pin code — ${pin.name}: farmhouses, land and rates | ${settings?.firmName ?? ""}`,
    description: `Pin code ${code} covers ${pin.name}. What farmhouses and farm land ask inside it, which pockets it contains, and what the registry costs.`,
    alternates: { canonical: joinPath(basePathFor(tenant), `/pin-code/${code}`) },
  };
}

/**
 * "122103 pin code sohna" and its ten variants are real, recurring searches,
 * and MagicBricks runs 1,147 pincode pages off the back of them. A pincode is
 * a container for pockets we do have figures for, so the page answers both the
 * postal question and the property one.
 */
export default async function PincodePage({ params }: Props) {
  const { tenant: tenantSlug, code } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!farmSearchEnabled(tenant.slug)) notFound();

  const pin = pinByCode(code);
  if (!pin) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const { sources, ...s } = aggregate(pin.pockets);

  const faqs = [
    { q: `Which area is pin code ${code}?`, a: `${code} covers ${pin.name} in Gurugram district, Haryana. Within it we track ${sources.map((v) => v.name).join(", ")}.` },
    {
      q: `What do farmhouses cost in ${code}?`,
      a: `Across those pockets, asking prices run ${crore(s.minPrice)} to ${crore(s.maxPrice)}, median ${crore(s.medianPrice)} on ${acres(s.medianArea)} — about ${perSqft(s.medianPerSqft)}. Asking prices from listing data, not transacted rates.`,
    },
    {
      q: "Does the pincode affect stamp duty?",
      a: "No — duty is charged on the circle rate, which is notified per village and land class rather than per pincode. Two plots in the same pincode can carry different circle rates.",
    },
  ];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Pin codes", url: p("/farmhouse") },
            { name: code, url: p(`/pin-code/${code}`) },
          ]),
        )}
      />
      <script {...jsonLdProps(buildFaqJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a }))))} />

      <GpSection tone="cream">
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-[color:var(--gp-muted)]">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-600)]">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/farmhouse")} className="hover:text-[color:var(--gp-gold-600)]">Farmhouses</Link>
          </nav>
          <GpEyebrow>Pin code {code}</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-3 max-w-3xl text-[color:var(--gp-ink)]">
            {code} — {pin.name}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
            Pin code {code} covers {pin.name} in Gurugram district. Inside it we track{" "}
            {s.listings} farmhouse and farm-land {s.listings === 1 ? "listing" : "listings"} across{" "}
            {sources.length} {sources.length === 1 ? "pocket" : "pockets"}.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
            <div>
              <div className="overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
                <table className="w-full min-w-[560px] text-[14px]">
                  <thead>
                    <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                      <th className="px-4 py-3 font-semibold">Pocket in {code}</th>
                      <th className="px-4 py-3 font-semibold">Listings</th>
                      <th className="px-4 py-3 font-semibold">Median asking</th>
                      <th className="px-4 py-3 font-semibold">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((village) => (
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
                        <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{crore(village.medianPrice)}</td>
                        <td className="px-4 py-2.5 font-medium text-[color:var(--gp-gold-600)]">
                          {perSqft(village.medianPerSqft)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                A pincode is a postal boundary, not a market one — two plots inside {code} can price
                very differently depending on which pocket and which approach road they sit on. Use
                it to find the area; use the pocket pages to price it.
              </p>
              <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                It does not decide your registry cost either. Stamp duty is charged on the circle
                rate, which is notified per village and per land class, so two plots sharing this
                pincode can carry different rates.
              </p>
              <p className="mt-5 text-[12px] text-[color:var(--gp-muted)]">
                Figures are asking prices from current listings, not transacted rates.
              </p>

              <div className="mt-10 border-t border-[color:var(--gp-border)] pt-8">
                <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">Questions we get asked</h2>
                <dl className="mt-5 space-y-5">
                  {faqs.map((faq) => (
                    <div key={faq.q}>
                      <dt className="text-[15px] font-semibold text-[color:var(--gp-ink)]">{faq.q}</dt>
                      <dd className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[color:var(--gp-body)]">{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] p-6">
                <h2 className="font-display text-[19px] text-[color:var(--gp-ink)]">
                  Looking in {pin.name}?
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                  Send us a khasra number or a budget and we will come back with what is live inside
                  this pincode this week.
                </p>
                <div className="mt-5">
                  <PremiumV2EnquiryForm basePath={basePath} context={`Pin code ${code} — ${pin.name}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-[color:var(--gp-border)] pt-8">
            <GpEyebrow>Other pin codes on the belt</GpEyebrow>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {PINCODES.filter((other) => other.code !== code).map((other) => (
                <Link
                  key={other.code}
                  href={p(`/pin-code/${other.code}`)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
                >
                  {other.code}
                  <span className="text-[11px] text-[color:var(--gp-muted)]">{other.name}</span>
                </Link>
              ))}
              <Link
                href={p("/land-rates")}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-900)] px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
              >
                Land &amp; circle rates
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
