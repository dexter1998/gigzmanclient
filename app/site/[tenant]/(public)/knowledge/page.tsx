import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Illustration from "@/components/site/Illustration";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings, getPublishedUpdates, getUpcomingCompliance } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { TDS_SECTIONS } from "@/lib/calculators/tds";
import { NEW_REGIME_SLABS, OLD_REGIME_SLABS, TAX_YEAR } from "@/lib/calculators/rates/fy-2026-27";
import { formatInr } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/site/[tenant]/knowledge">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Knowledge Centre — ${settings?.firmName ?? ""}`,
    description:
      "Reference tables, statutory dates, regulatory portals and professional updates for taxpayers and businesses.",
  };
}

const PORTALS = [
  { label: "Income Tax e-Filing", url: "https://www.incometax.gov.in", note: "Returns, e-verification, Form 26AS and AIS" },
  { label: "GST Portal", url: "https://www.gst.gov.in", note: "Registration, returns and refunds" },
  { label: "MCA", url: "https://www.mca.gov.in", note: "Company and LLP filings" },
  { label: "TRACES", url: "https://www.tdscpc.gov.in", note: "TDS statements and certificates" },
  { label: "ICEGATE", url: "https://www.icegate.gov.in", note: "Customs filings" },
  { label: "EPFO", url: "https://www.epfindia.gov.in", note: "Provident fund contributions" },
  { label: "ESIC", url: "https://www.esic.gov.in", note: "State insurance contributions" },
  { label: "ICAI", url: "https://www.icai.org", note: "Institute of Chartered Accountants of India" },
];

function slabRows(slabs: { upTo: number | null; rate: number }[]) {
  let lower = 0;
  return slabs.map((slab) => {
    const row = {
      range: slab.upTo
        ? `${formatInr(lower)} – ${formatInr(slab.upTo)}`
        : `Above ${formatInr(lower)}`,
      rate: `${(slab.rate * 100).toFixed(0)}%`,
    };
    lower = slab.upTo ?? lower;
    return row;
  });
}

export default async function KnowledgePage(props: PageProps<"/site/[tenant]/knowledge">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [updates, compliance] = await Promise.all([
    getPublishedUpdates(tenant.id),
    getUpcomingCompliance(tenant.id),
  ]);

  return (
    <>
      <Section tone="tint" size="md">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
          <Link href={p("/")} className="inline-block py-1 hover:text-navy">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">Knowledge Centre</span>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeader
            eyebrow="Reference"
            title="Reference material for recurring compliance questions."
            description="General reference tables and links. Applicability depends on the taxpayer category and the provisions in force — confirm before relying on any figure here."
          />
          </div>
          <Illustration
            name="percent-tray"
            sizes="(max-width: 1024px) 55vw, 300px"
            className="mx-auto hidden h-auto w-full max-w-[280px] lg:block"
          />
        </div>
      </Section>

      {/* Rate reference tables */}
      <Section tone="page" size="md">
        <h2 className="display-md">Rate reference</h2>
        <p className="mt-2 text-[13px] text-ink-muted">
          {TAX_YEAR} · awaiting professional verification against the provisions in force.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <p className="text-[14px] font-semibold text-ink">Income tax slabs — new regime</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-tint text-left text-[11px] uppercase tracking-[0.06em] text-ink-subtle">
                    <th className="px-5 py-2.5 font-medium">Total income</th>
                    <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {slabRows(NEW_REGIME_SLABS).map((row) => (
                    <tr key={row.range}>
                      <td className="px-5 py-2.5 text-ink-muted">{row.range}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-ink">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <p className="text-[14px] font-semibold text-ink">
                Income tax slabs — old regime (below 60)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-tint text-left text-[11px] uppercase tracking-[0.06em] text-ink-subtle">
                    <th className="px-5 py-2.5 font-medium">Total income</th>
                    <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {slabRows(OLD_REGIME_SLABS.general).map((row) => (
                    <tr key={row.range}>
                      <td className="px-5 py-2.5 text-ink-muted">{row.range}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-ink">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card padded={false} className="mt-4 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[14px] font-semibold text-ink">TDS rates and thresholds</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead>
                <tr className="border-b border-line bg-tint text-left text-[11px] uppercase tracking-[0.06em] text-ink-subtle">
                  <th className="px-5 py-2.5 font-medium">Section</th>
                  <th className="px-5 py-2.5 font-medium">Nature of payment</th>
                  <th className="px-5 py-2.5 text-right font-medium">Threshold</th>
                  <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                  <th className="px-5 py-2.5 text-right font-medium">No PAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {TDS_SECTIONS.map((section) => (
                  <tr key={section.code}>
                    <td className="px-5 py-2.5 font-medium text-ink">{section.code}</td>
                    <td className="px-5 py-2.5 text-ink-muted">{section.label}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-ink-muted">
                      {formatInr(section.threshold)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-ink">
                      {(section.residentRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-ink-muted">
                      {(section.noPanRate * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-4 rounded-[10px] bg-accent-soft p-4 text-[12px] leading-relaxed text-ink-muted">
          These tables are published for general reference. Rates, thresholds and slab structures
          depend on the provisions in force and the taxpayer category, and are subject to amendment.
          Confirm the applicable position before acting.
        </p>
      </Section>

      {/* Statutory dates + updates */}
      <Section tone="tint" size="md">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="display-md">Upcoming statutory dates</h2>
              <Link
                href={p("/compliance-calendar")}
                className="inline-block shrink-0 py-1 text-[13px] font-medium text-navy hover:underline"
              >
                Full calendar
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-surface">
              {compliance.slice(0, 6).map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug text-ink">{event.title}</p>
                    <p className="mt-0.5 text-[11px] text-ink-subtle">{event.category}</p>
                  </div>
                  <p className="shrink-0 text-[12px] font-medium text-accent">
                    {formatDate(event.extendedDueDate ?? event.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="display-md">Recent updates</h2>
              <Link
                href={p("/updates")}
                className="inline-block shrink-0 py-1 text-[13px] font-medium text-navy hover:underline"
              >
                All updates
              </Link>
            </div>
            <ul className="mt-5 space-y-3">
              {updates.slice(0, 4).map((update) => (
                <li key={update.id}>
                  <Link
                    href={p(`/updates/${update.slug}`)}
                    className="block rounded-[10px] border border-line bg-surface p-4 hover:border-navy-muted"
                  >
                    <Badge tone="accent">{update.category}</Badge>
                    <p className="mt-2.5 text-[13px] font-medium leading-snug text-ink">
                      {update.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-subtle">
                      {formatDate(update.publishedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Regulatory portals */}
      <Section tone="page" size="md">
        <h2 className="display-md">Regulatory portals</h2>
        <p className="mt-2 text-[13px] text-ink-muted">
          Direct links to the official portals used for filings and verification.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PORTALS.map((portal) => (
            <a
              key={portal.url}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-navy-muted"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-ink">{portal.label}</p>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{portal.note}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 rounded-[10px] bg-navy p-6 text-white sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold">Estimate before you discuss</p>
              <p className="mt-1.5 text-[13px] text-white/70">
                Indicative income tax, TDS and GST calculators.
              </p>
            </div>
            <Link
              href={p("/calculators")}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-[8px] bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover"
            >
              Open calculators
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
