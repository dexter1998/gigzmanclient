import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Badge, { statusTone } from "@/components/ui/Badge";
import { CALCULATOR_STATUS_LABELS, formatDate } from "@/lib/format";
import type { calculators } from "@/lib/db/schema";

interface CalculatorShellProps {
  calculator: typeof calculators.$inferSelect;
  contactHref: string;
  breadcrumbHref: string;
  children: React.ReactNode;
}

/**
 * Common frame for every calculator: heading, review state, the result
 * disclaimer, and the CTA that carries only the calculator's identity forward.
 */
export default function CalculatorShell({
  calculator,
  contactHref,
  breadcrumbHref,
  children,
}: CalculatorShellProps) {
  const needsReview =
    calculator.status === "ca_review_required" || calculator.status === "update_required";

  return (
    <>
      <section className="bg-cream py-10 sm:py-14">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
            <Link href={breadcrumbHref} className="hover:text-navy">
              Calculators
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink-muted">{calculator.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(calculator.status)}>
              {CALCULATOR_STATUS_LABELS[calculator.status] ?? calculator.status}
            </Badge>
            <span className="text-[12px] text-ink-subtle">
              {calculator.taxYear} · v{calculator.version}
            </span>
          </div>

          <h1 className="display-lg mt-4 max-w-3xl">{calculator.title}</h1>
          <p className="prose-body mt-4 max-w-2xl text-[15px]">{calculator.description}</p>

          {needsReview ? (
            <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-[10px] border border-accent/30 bg-accent-soft px-4 py-3.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-medium text-ink">
                  Rates awaiting professional verification
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                  The rate set applied here has not yet been confirmed against the provisions in
                  force for {calculator.taxYear}. Treat the result as provisional and confirm before
                  relying on it.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-surface py-10 sm:py-14">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
          {children}

          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-[10px] bg-accent-soft p-5">
              <p className="text-[13px] font-semibold text-ink">Assumptions and limits</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                {calculator.disclaimer}
              </p>
              {calculator.sourceNote ? (
                <p className="mt-2.5 text-[11px] leading-relaxed text-ink-subtle">
                  {calculator.sourceNote}
                  {calculator.lastReviewedAt
                    ? ` Last reviewed ${formatDate(calculator.lastReviewedAt)}.`
                    : ""}
                </p>
              ) : null}
              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-subtle">
                Values you enter stay in your browser. They are not sent to the firm and are not
                included in any enquiry you submit.
              </p>
            </div>

            <div className="rounded-[10px] bg-navy p-5 text-white">
              <p className="text-[14px] font-semibold">Discuss this calculation</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/70">
                An estimate is a starting point. Share your circumstances to confirm the position.
              </p>
              <Link
                href={`${contactHref}?calculator=${calculator.key}`}
                className="mt-4 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[8px] bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover"
              >
                Discuss This Calculation
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
