import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { GpContainer, GpEyebrow } from "./gp-primitives";
import { EmiPanel, RentYieldPanel } from "./CalculatorsV2";
import StampDutyPanelV2 from "./StampDutyPanelV2";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getCalculator } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default async function PremiumV2CalculatorDetailPage({
  tenant,
  calculatorKey,
}: {
  tenant: Tenant;
  calculatorKey: string;
}) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const disclaimerHref = p("/legal/calculator-disclaimer");

  const [settings, calculator] = await Promise.all([
    getFirmSettings(tenant.id),
    getCalculator(tenant.id, calculatorKey),
  ]);

  if (!settings || !calculator || calculator.status === "archived") notFound();

  const needsReview = calculator.status !== "active" || !calculator.reviewerName;

  return (
    <div className="gp-section bg-[color:var(--gp-cream-100)]">
      <GpContainer>
        {/* Centered, not left-aligned within the full-width container — a
            single ~672px calculator column left-aligned inside a 1792px-wide
            container reads as broken on wide screens (all the whitespace
            piling up on one side); centering keeps it balanced instead. */}
        <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-[color:var(--gp-muted)]">
          <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={p("/calculators")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
            Calculators
          </Link>
          <span className="mx-1.5">/</span>
          <span>{calculator.title}</span>
        </nav>

        <GpEyebrow>{calculator.taxYear ? calculator.taxYear : "Calculator"}</GpEyebrow>
        <h1 className="gp-section-title font-display mt-3 max-w-3xl text-[color:var(--gp-ink)]">
          {calculator.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
          {calculator.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[11.5px] text-[color:var(--gp-muted)]">
          <span>Formula v{calculator.version}</span>
          {calculator.status === "active" && calculator.reviewerName ? (
            <>
              <span className="text-[color:var(--gp-border)]">·</span>
              <span>
                Reviewed by {calculator.reviewerName}
                {calculator.lastReviewedAt ? ` on ${formatDate(calculator.lastReviewedAt)}` : ""}
              </span>
            </>
          ) : (
            <>
              <span className="text-[color:var(--gp-border)]">·</span>
              <span>Awaiting professional verification</span>
            </>
          )}
        </div>

        {needsReview ? (
          <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-gold-600)]/25 bg-[color:var(--gp-gold-600)]/[0.08] px-4 py-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-medium text-[color:var(--gp-ink)]">
                Rates awaiting professional verification
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--gp-body)]">
                The rate set applied here has not yet been confirmed against the provisions in
                force{calculator.taxYear ? ` for ${calculator.taxYear}` : ""}. Treat the result as
                provisional and confirm before relying on it.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-10 max-w-2xl">
          {calculator.key === "emi" ? <EmiPanel disclaimerHref={disclaimerHref} /> : null}
          {calculator.key === "rental-yield" ? <RentYieldPanel disclaimerHref={disclaimerHref} /> : null}
          {calculator.key === "stamp-duty" ? <StampDutyPanelV2 basePath={basePath} /> : null}
        </div>

        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4">
          {calculator.disclaimer ? (
            <div className="rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)] p-5">
              <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">
                Assumptions and limits
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--gp-body)]">
                {calculator.disclaimer}
              </p>
              {calculator.sourceNote ? (
                <p className="mt-2.5 text-[11px] leading-relaxed text-[color:var(--gp-muted)]">
                  {calculator.sourceNote}
                </p>
              ) : null}
              <p className="mt-2.5 text-[11px] leading-relaxed text-[color:var(--gp-muted)]">
                Values you enter stay in your browser. They are not sent to us and are not
                included in any enquiry you submit.
              </p>
            </div>
          ) : null}

          <div
            className="rounded-[var(--gp-radius-md)] p-5 text-white"
            style={{ background: "var(--gp-gradient-dark-section)" }}
          >
            <p className="font-display text-[18px] text-white">Talk to an advisor about this number</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
              An estimate is a starting point. Share your circumstances so we can confirm the
              actual figure with you.
            </p>
            <Link
              href={`${p("/contact")}?calculator=${calculator.key}`}
              className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-4 text-[13px] font-semibold text-[color:var(--gp-forest-950)] hover:bg-[color:var(--gp-gold-300)]"
            >
              Talk to an Advisor
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
        </div>
      </GpContainer>
    </div>
  );
}
