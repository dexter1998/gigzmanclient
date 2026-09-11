import Link from "next/link";
import { notFound } from "next/navigation";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getLocalities, getProperties } from "@/lib/content";
import { buildAffordability, affordabilityVerdict } from "@/lib/home-loan/affordability";
import { amountFaqs, bankFaqs } from "@/lib/home-loan/faqs";
import { findLender, rateFor, LENDER_DISCLAIMER, type Lender } from "@/lib/home-loan/banks";
import { findAmountBySlug, findAmountByStem, type LoanAmount } from "@/lib/home-loan/amounts";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import { formatIndianPrice } from "@/lib/format";
import EmiCalculatorHeroV2 from "./EmiCalculatorHeroV2";
import BankLoanHeroV2 from "./BankLoanHeroV2";
import LoanFaqV2 from "./LoanFaqV2";
import {
  TenureLadderV2,
  GurugramBudgetV2,
  AmortisationV2,
  LenderComparisonV2,
  EligibilityDocsV2,
  RelatedAmountsV2,
} from "./LoanSectionsV2";
import { channelPartnerClaimAllowed } from "@/lib/home-loan/enabled";

function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[12.5px] text-white/55">
      {items.map((item, i) => (
        <span key={item.name}>
          {i > 0 ? <span className="mx-1.5">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-[color:var(--gp-gold-300)]">
              {item.name}
            </Link>
          ) : (
            <span className="text-white/85">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

async function loadContext(tenant: Tenant) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const [settings, localities, properties] = await Promise.all([
    getFirmSettings(tenant.id),
    getLocalities(tenant.id),
    getProperties(tenant.id, {}),
  ]);
  if (!settings) notFound();
  return { basePath, p, settings, localities, properties };
}

/* ══════════════════════════════════ amount page (with optional lender) */

export async function AmountLoanPage({
  tenant,
  amountSlug,
  lenderSlug,
}: {
  tenant: Tenant;
  amountSlug: string;
  lenderSlug?: string;
}) {
  const amount = lenderSlug ? findAmountByStem(amountSlug) : findAmountBySlug(amountSlug);
  if (!amount) notFound();
  const lender = lenderSlug ? findLender(lenderSlug) : undefined;
  if (lenderSlug && !lender) notFound();

  const { p, settings, localities, properties } = await loadContext(tenant);
  const channelPartner = channelPartnerClaimAllowed(tenant.slug);
  const { rate, isLenderPublished } = rateFor(lender);
  const snapshot = buildAffordability(amount.value, localities, properties);
  const verdict = affordabilityVerdict(snapshot);
  const faqs = amountFaqs(amount, lender);

  const title = lender
    ? `${lender.name} ${amount.label} Home Loan EMI in Gurugram`
    : `${amount.label} Home Loan EMI in Gurugram`;

  const crumbs = [
    { name: "Home", href: p("/") },
    { name: "Home Loans", href: p("/home-loan") },
    ...(lender ? [{ name: lender.name, href: p(`/home-loan/${lender.slug}`) }] : []),
    { name: amount.label },
  ];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd(crumbs.map((c) => ({ name: c.name, url: c.href ?? p("/home-loan") }))),
        )}
      />
      {buildFaqJsonLd(faqs) ? <script {...jsonLdProps(buildFaqJsonLd(faqs))} /> : null}

      <EmiCalculatorHeroV2
        heading={title}
        subheading={
          lender
            ? `Work out the EMI on a ${amount.plain} ${lender.name} home loan, see what that budget buys across Gurugram's corridors, and get help running the application through to sanction.`
            : `Work out the EMI on a ${amount.plain} home loan, compare it across every tenure, and see exactly what that budget buys across Gurugram's property corridors.`
        }
        initialPrice={snapshot.propertyBudget}
        initialDownPayment={snapshot.downPayment}
        initialRate={rate}
        intentKey={lender ? "bank" : "homeLoan"}
        breadcrumb={<Crumbs items={crumbs} />}
      />

      <TenureLadderV2
        amount={amount}
        rate={rate}
        lenderName={isLenderPublished ? lender?.name : undefined}
      />

      <GurugramBudgetV2 amount={amount} snapshot={snapshot} verdict={verdict} p={p} />

      <AmortisationV2 amount={amount} rate={rate} years={20} />

      <LenderComparisonV2
        amount={amount}
        p={p}
        activeLender={lender}
        channelPartner={channelPartner}
      />

      <EligibilityDocsV2 amount={amount} lender={lender} />

      <LoanFaqV2
        faqs={faqs}
        heading={`${amount.label} home loan questions${lender ? `, answered for ${lender.name}` : ""}`}
      />

      <RelatedAmountsV2 current={amount} p={p} lender={lender} />

    </>
  );
}

/* ═════════════════════════════════════════════════════ lender page */

export async function LenderLoanPage({ tenant, lenderSlug }: { tenant: Tenant; lenderSlug: string }) {
  const lender = findLender(lenderSlug);
  if (!lender) notFound();

  const { p, settings, localities, properties } = await loadContext(tenant);
  const { rate } = rateFor(lender);
  // 75 lakh is the Gurugram mid-market ticket and the default the hero form
  // opens on, so the affordability panel below matches what people see first.
  const DEFAULT_LOAN = 7_500_000;
  const snapshot = buildAffordability(DEFAULT_LOAN, localities, properties);
  const faqs = bankFaqs(lender);

  const crumbs = [
    { name: "Home", href: p("/") },
    { name: "Home Loans", href: p("/home-loan") },
    { name: lender.name },
  ];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd(crumbs.map((c) => ({ name: c.name, url: c.href ?? p("/home-loan") }))),
        )}
      />
      {buildFaqJsonLd(faqs) ? <script {...jsonLdProps(buildFaqJsonLd(faqs))} /> : null}

      <BankLoanHeroV2
        lender={lender}
        defaultAmount={DEFAULT_LOAN}
        headline={`${lender.name} Home Loan Approval in Gurugram`}
        intro={`Check your indicative eligibility and get guided support for documentation, application coordination and home-loan processing in Gurugram.`}
        breadcrumb={<Crumbs items={crumbs} />}
      />

      <LenderTermsV2 lender={lender} />

      <GurugramBudgetV2
        amount={{ slug: "", value: DEFAULT_LOAN, label: formatIndianPrice(DEFAULT_LOAN), plain: "75 lakh" }}
        snapshot={snapshot}
        verdict={affordabilityVerdict(snapshot)}
        p={p}
      />

      <EligibilityDocsV2
        amount={{ slug: "", value: DEFAULT_LOAN, label: formatIndianPrice(DEFAULT_LOAN), plain: "75 lakh" }}
        lender={lender}
      />

      <LoanFaqV2 faqs={faqs} heading={`${lender.name} home loan questions`} />

      <RelatedAmountsV2 p={p} lender={lender} />

    </>
  );
}

/** Rates, fees and tenure exactly as the lender publishes them — or an honest gap. */
function LenderTermsV2({ lender }: { lender: Lender }) {
  const rows = [
    {
      label: "Starting interest rate",
      value: lender.rateFrom ? `From ${lender.rateFrom}% p.a. (floating)` : null,
      fallback: "Not published as a single headline figure — we confirm the live rate with the lender when your file is prepared.",
    },
    { label: "Processing fee", value: lender.processingFee ?? null, fallback: "Not published — we confirm it in writing before you commit." },
    {
      label: "Maximum tenure",
      value: lender.maxTenureYears ? `Up to ${lender.maxTenureYears} years` : null,
      fallback: "Confirmed at sanction, limited by your age at maturity.",
    },
  ];

  return (
    <section className="gp-section bg-tint">
      <div className="gp-container">
        <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">Published terms</p>
        <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
          {lender.name} home loan at a glance
        </h2>

        <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5"
            >
              <dt className="text-[11.5px] uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                {row.label}
              </dt>
              <dd
                className={`mt-2 leading-relaxed ${
                  row.value
                    ? "text-[15px] font-semibold text-[color:var(--gp-ink)]"
                    : "text-[13px] text-[color:var(--gp-muted)]"
                }`}
              >
                {row.value ?? row.fallback}
              </dd>
            </div>
          ))}
        </dl>

        {lender.ratesAsOf ? (
          <p className="mt-4 text-[12px] text-[color:var(--gp-muted)]">
            Read from {lender.name}&rsquo;s own published pages on {lender.ratesAsOf}. Starting rates are
            a floor for the strongest credit profiles, not an offer.
          </p>
        ) : null}

        <p className="mt-5 max-w-3xl text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
          {LENDER_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

export { findAmountBySlug, findAmountByStem, findLender };
export type { LoanAmount, Lender };
