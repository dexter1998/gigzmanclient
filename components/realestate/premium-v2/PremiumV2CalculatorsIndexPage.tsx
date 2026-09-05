import Link from "next/link";
import { AlertTriangle, ArrowRight, Home, Percent, ShieldCheck } from "lucide-react";
import { GpContainer, GpEyebrow } from "./gp-primitives";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getCalculators } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { calculators as calculatorsTable } from "@/lib/db/schema";

type CalculatorRow = typeof calculatorsTable.$inferSelect;

const ICONS: Record<string, typeof Home> = {
  emi: Home,
  "stamp-duty": ShieldCheck,
  "rental-yield": Percent,
};

function reviewStatus(calc: CalculatorRow): { label: string; reviewed: boolean } {
  const reviewed = calc.status === "active" && Boolean(calc.reviewerName);
  if (reviewed) {
    return {
      label: calc.lastReviewedAt
        ? `Reviewed by ${calc.reviewerName} on ${formatDate(calc.lastReviewedAt)}`
        : `Reviewed by ${calc.reviewerName}`,
      reviewed: true,
    };
  }
  return { label: "Awaiting professional verification", reviewed: false };
}

export default async function PremiumV2CalculatorsIndexPage({ tenant }: { tenant: Tenant }) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [settings, allCalculators] = await Promise.all([
    getFirmSettings(tenant.id),
    getCalculators(tenant.id),
  ]);

  if (!settings) return null;

  const calculatorList = allCalculators.filter((c) => c.status !== "archived");
  const anyUnreviewed = calculatorList.some((c) => !reviewStatus(c).reviewed);

  return (
    <div className="gp-section bg-[color:var(--gp-cream-100)]">
      <GpContainer>
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-[color:var(--gp-muted)]">
          <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span>Calculators</span>
        </nav>

        <GpEyebrow>Tools for Your Decision</GpEyebrow>
        <h1 className="gp-section-title font-display mt-3 max-w-2xl text-[color:var(--gp-ink)]">
          Indicative calculations with visible assumptions.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
          Use these to form a budget before a site visit. Results do not replace professional
          advice, and no calculator here recommends a course of action.
        </p>

        {anyUnreviewed ? (
          <div className="mt-7 flex max-w-3xl items-start gap-3 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-gold-600)]/25 bg-[color:var(--gp-gold-600)]/[0.08] px-4 py-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-[color:var(--gp-body)]">
              Some calculators are awaiting professional verification of the rates in force for
              this period. Treat those results as provisional.
            </p>
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {calculatorList.map((calc) => {
            const Icon = ICONS[calc.key] ?? Home;
            const status = reviewStatus(calc);
            return (
              <Link
                key={calc.id}
                href={p(`/calculators/${calc.key}`)}
                className="group flex flex-col rounded-[var(--gp-radius-lg)] p-7 text-white transition-transform hover:-translate-y-1"
                style={{ background: "var(--gp-gradient-dark-section)" }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: "var(--gp-gradient-glow)" }}
                >
                  <Icon className="h-5 w-5 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                </div>

                <h2 className="font-display mt-5 text-[22px] leading-snug text-white">{calc.title}</h2>
                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-white/65">
                  {calc.description}
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      status.reviewed ? "bg-[color:var(--gp-gold-300)]" : "bg-white/40"
                    }`}
                    aria-hidden="true"
                  />
                  <p className="text-[11.5px] leading-relaxed text-white/50">{status.label}</p>
                </div>

                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--gp-gold-300)]">
                  Open calculator
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-12 max-w-3xl rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)] p-5 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
          Values entered into these calculators are processed in your browser. They are not
          transmitted to us, are not stored, and are not included in any enquiry you submit
          afterwards.
        </p>
      </GpContainer>
    </div>
  );
}
