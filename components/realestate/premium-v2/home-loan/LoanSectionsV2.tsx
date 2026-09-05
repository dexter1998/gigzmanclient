import Link from "next/link";
import { ArrowRight, Building2, FileText, ShieldCheck, TrendingUp } from "lucide-react";
import { calculateEmi } from "@/lib/calculators/emi";
import { buildAmortisationSchedule } from "@/lib/calculators/amortisation";
import { EMI_TENURE_PRESETS_YEARS } from "@/lib/calculators/rates/gurugram-2026";
import { formatInr, formatIndianPrice } from "@/lib/format";
import { LENDERS, LENDER_DISCLAIMER, rateFor, type Lender } from "@/lib/home-loan/banks";
import LenderLogo from "./LenderLogo";
import { LOAN_AMOUNTS, amountSlugStem, type LoanAmount } from "@/lib/home-loan/amounts";
import type { AffordabilitySnapshot } from "@/lib/home-loan/affordability";
import { GpContainer, GpEyebrow, GpSection } from "../gp-primitives";

/* ─────────────────────────────────────────────── tenure ladder
   The single most consistent pattern across every ranking page: each
   tenure gets its own heading, because that is what matches
   "<amount> home loan emi for 20 years" queries. Deliberately not
   collapsed into one table.                                        */

export function TenureLadderV2({
  amount,
  rate,
  lenderName,
}: {
  amount: LoanAmount;
  rate: number;
  lenderName?: string;
}) {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>EMI by tenure</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
          {amount.label} home loan EMI across every tenure
        </h2>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
          Calculated at {rate}% p.a. on a reducing balance
          {lenderName ? `, using ${lenderName}'s indicative rate` : ""}. A longer tenure lowers the
          monthly outgo but raises what you pay in total — both numbers are shown so the trade-off
          is visible rather than implied.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMI_TENURE_PRESETS_YEARS.map((years) => {
            const r = calculateEmi({ principal: amount.value, annualRatePercent: rate, tenureYears: years });
            return (
              <div
                key={years}
                className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5"
              >
                <h3 className="font-display text-[18px] text-[color:var(--gp-ink)]">
                  {amount.label} EMI for {years} years
                </h3>
                <p className="font-sans mt-3 text-[26px] font-semibold leading-none text-[color:var(--gp-gold-600)]">
                  {formatInr(Math.round(r.monthlyEmi))}
                </p>
                <p className="mt-1 text-[12px] text-[color:var(--gp-muted)]">per month</p>
                <dl className="mt-4 space-y-1.5 border-t border-[color:var(--gp-border)] pt-3 text-[12.5px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[color:var(--gp-muted)]">Total interest</dt>
                    <dd className="font-medium text-[color:var(--gp-ink)]">
                      {formatIndianPrice(r.totalInterest)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[color:var(--gp-muted)]">Total payable</dt>
                    <dd className="font-medium text-[color:var(--gp-ink)]">
                      {formatIndianPrice(r.totalPayment)}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </GpContainer>
    </GpSection>
  );
}

/* ─────────────────────────────────────── what it buys in Gurugram
   The reason these pages exist for a property brokerage rather than a
   lender: it converts a financing query into property intent, using
   the tenant's own corridor pricing and live listings.              */

export function GurugramBudgetV2({
  amount,
  snapshot,
  verdict,
  p,
}: {
  amount: LoanAmount;
  snapshot: AffordabilitySnapshot;
  verdict: string;
  p: (path: string) => string;
}) {
  return (
    <GpSection tone="forest">
      <GpContainer>
        <GpEyebrow className="text-[color:var(--gp-gold-300)]">In Gurugram terms</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 text-white">
          What a {amount.plain} loan actually buys here
        </h2>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-white/75">{verdict}</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Loan amount", value: formatIndianPrice(snapshot.loanAmount) },
            { label: "Down payment (20%)", value: formatIndianPrice(snapshot.downPayment) },
            { label: "Property budget", value: formatIndianPrice(snapshot.propertyBudget) },
          ].map((s) => (
            <div key={s.label} className="rounded-[var(--gp-radius-md)] border border-white/12 bg-white/[0.04] px-5 py-4">
              <p className="text-[11.5px] uppercase tracking-[0.08em] text-white/50">{s.label}</p>
              <p className="font-sans mt-1.5 text-[24px] font-semibold text-[color:var(--gp-gold-300)]">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {snapshot.corridors.length > 0 ? (
          <>
            <h3 className="font-display mt-12 text-[21px] text-white">Corridor by corridor</h3>
            <div className="mt-5 overflow-x-auto rounded-[var(--gp-radius-md)] border border-white/12">
              <table className="w-full min-w-[560px] text-[13.5px]">
                <thead>
                  <tr className="bg-white/[0.05] text-left text-[11px] uppercase tracking-[0.07em] text-white/55">
                    <th className="px-4 py-3 font-semibold">Corridor</th>
                    <th className="px-4 py-3 font-semibold">Avg. rate</th>
                    <th className="px-4 py-3 font-semibold">Area this budget reaches</th>
                    <th className="px-4 py-3 font-semibold">Realistic?</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.corridors.map((c) => (
                    <tr key={c.locality.id} className="border-t border-white/10">
                      <td className="px-4 py-3">
                        <Link
                          href={p(`/localities/${c.locality.slug}`)}
                          className="font-medium text-white hover:text-[color:var(--gp-gold-300)]"
                        >
                          {c.locality.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {formatInr(c.locality.avgPricePerSqft ?? 0)}/sq.ft
                      </td>
                      <td className="px-4 py-3 text-white/85">
                        ~{c.affordableSqft.toLocaleString("en-IN")} sq.ft
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.isComfortable
                              ? "text-[color:var(--gp-gold-300)]"
                              : c.isRealistic
                                ? "text-white/75"
                                : "text-white/40"
                          }
                        >
                          {c.isComfortable ? "Comfortable" : c.isRealistic ? "Workable" : "Below entry"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-white/45">
              Areas are indicative built-up equivalents at each corridor&rsquo;s working average rate,
              before stamp duty, registration and interiors. Corridor rates are our own estimates
              pending independent verification, not certified valuations.
            </p>
          </>
        ) : null}

        {snapshot.matches.length > 0 ? (
          <>
            <h3 className="font-display mt-12 text-[21px] text-white">
              Listings within this budget right now
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {snapshot.matches.map((property) => (
                <Link
                  key={property.id}
                  href={p(`/properties/${property.slug}`)}
                  className="group rounded-[var(--gp-radius-md)] border border-white/12 bg-white/[0.04] p-5 transition-colors hover:border-[color:var(--gp-gold-600)]"
                >
                  <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">
                    {property.locality ?? property.corridor}
                  </p>
                  <h4 className="font-display mt-1.5 text-[18px] text-white">{property.title}</h4>
                  <p className="mt-1.5 text-[12.5px] text-white/60">
                    {[property.beds ? `${property.beds} BHK` : null, property.area ? `${property.area} sq.ft` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="font-sans mt-3 text-[19px] font-semibold text-white">
                    {property.priceLabel ?? formatIndianPrice(property.price ?? 0)}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[color:var(--gp-gold-300)]">
                    View property
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <Link
          href={p(`/properties?maxPrice=${snapshot.propertyBudget}`)}
          className="mt-8 inline-flex min-h-[50px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
        >
          Browse everything under {formatIndianPrice(snapshot.propertyBudget)}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </GpContainer>
    </GpSection>
  );
}

/* ─────────────────────────────────────────── amortisation schedule */

export function AmortisationV2({ amount, rate, years }: { amount: LoanAmount; rate: number; years: number }) {
  const schedule = buildAmortisationSchedule(amount.value, rate, years);
  if (schedule.length === 0) return null;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Repayment schedule</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
          {amount.label} amortisation over {years} years
        </h2>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
          Early instalments are mostly interest; the principal only starts falling quickly in the
          second half. This is why prepaying in the first few years saves disproportionately more
          than prepaying later.
        </p>

        <div className="mt-8 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
          <table className="w-full min-w-[620px] text-[13.5px]">
            <thead>
              <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                <th className="px-4 py-3 font-semibold">Year</th>
                <th className="px-4 py-3 font-semibold">Principal paid</th>
                <th className="px-4 py-3 font-semibold">Interest paid</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Repaid</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="border-t border-[color:var(--gp-border)]">
                  <td className="px-4 py-2.5 font-medium text-[color:var(--gp-ink)]">{row.year}</td>
                  <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{formatIndianPrice(row.principalPaid)}</td>
                  <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{formatIndianPrice(row.interestPaid)}</td>
                  <td className="px-4 py-2.5 text-[color:var(--gp-body)]">{formatIndianPrice(row.balance)}</td>
                  <td className="px-4 py-2.5 text-[color:var(--gp-gold-600)]">{row.percentRepaid.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GpContainer>
    </GpSection>
  );
}

/* ────────────────────────────────────────── lender comparison grid
   The bridge between the two page families — every amount page links
   into every bank page at that amount.                              */

export function LenderComparisonV2({
  amount,
  p,
  activeLender,
}: {
  amount: LoanAmount;
  p: (path: string) => string;
  activeLender?: Lender;
}) {
  const stem = amountSlugStem(amount);

  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Compare lenders</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
          {amount.label} home loan across lenders
        </h2>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
          We are an authorised channel partner for the lenders below and can run your file with more
          than one in parallel. Published rates move frequently, so we quote the current figure at
          the time of your application rather than printing a number that may already be stale.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LENDERS.map((lender) => {
            const { rate, isLenderPublished } = rateFor(lender);
            const emi = calculateEmi({ principal: amount.value, annualRatePercent: rate, tenureYears: 20 });
            const isActive = activeLender?.slug === lender.slug;
            return (
              <Link
                key={lender.slug}
                href={p(`/home-loan/${lender.slug}/${stem}`)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-4 rounded-[var(--gp-radius-md)] border bg-white p-4 transition-colors ${
                  isActive
                    ? "border-[color:var(--gp-gold-600)]"
                    : "border-[color:var(--gp-border)] hover:border-[color:var(--gp-gold-600)]"
                }`}
              >
                <LenderLogo lender={lender} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[color:var(--gp-ink)]">
                    {lender.name}
                  </span>
                  <span className="block text-[12px] text-[color:var(--gp-muted)]">
                    {isLenderPublished
                      ? `From ${rate}% · ~${formatInr(Math.round(emi.monthlyEmi))}/mo`
                      : "Current rate on request"}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[color:var(--gp-muted)] transition-colors group-hover:text-[color:var(--gp-gold-600)]"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>

        <p className="mt-6 max-w-3xl text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
          {LENDER_DISCLAIMER}
        </p>
      </GpContainer>
    </GpSection>
  );
}

/* ─────────────────────────────────── eligibility, docs and charges */

export function EligibilityDocsV2({ amount, lender }: { amount: LoanAmount; lender?: Lender }) {
  // Lenders commonly work to a ~50-55% FOIR; 50% is the conservative end,
  // so the figure below is a floor rather than a promise.
  const emi20 = calculateEmi({
    principal: amount.value,
    annualRatePercent: rateFor(lender).rate,
    tenureYears: 20,
  });
  const indicativeMonthlyIncome = Math.round((emi20.monthlyEmi / 0.5) / 1000) * 1000;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <GpEyebrow>Eligibility</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              What you need to qualify
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              For {amount.label} over 20 years, most lenders look for a monthly income of roughly{" "}
              <strong className="text-[color:var(--gp-ink)]">
                {formatInr(indicativeMonthlyIncome)}
              </strong>{" "}
              or more, on the basis that total EMIs stay near half of net income. Existing loans and
              card balances count against that limit.
            </p>

            <dl className="mt-7 space-y-4">
              {[
                { icon: ShieldCheck, t: "Credit score", d: "750+ gets the best pricing. Between 700 and 750 usually still sanctions, at a higher rate." },
                { icon: TrendingUp, t: "Income stability", d: "Salaried: 2+ years of employment. Self-employed: 3 years of filed returns and a stable turnover." },
                { icon: Building2, t: "Property clearance", d: "RERA registration, clear title and an approved plan. We check these before the file goes in." },
                { icon: FileText, t: "Age at maturity", d: "The loan generally has to close by 60 for salaried and 65 for self-employed applicants." },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.t} className="flex gap-3.5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    <div>
                      <dt className="text-[14.5px] font-semibold text-[color:var(--gp-ink)]">{row.t}</dt>
                      <dd className="mt-0.5 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">{row.d}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>

          <div>
            <GpEyebrow>Documents</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              What to keep ready
            </h2>
            <div className="mt-6 space-y-6">
              {[
                {
                  t: "Salaried applicants",
                  items: ["PAN and Aadhaar", "Last 3 months' salary slips", "6 months' bank statements", "Form 16 / last 2 years' ITR", "Employment proof"],
                },
                {
                  t: "Self-employed applicants",
                  items: ["PAN and Aadhaar", "Last 3 years' ITR with computation", "Audited financials", "12 months' business account statements", "Business registration proof"],
                },
                {
                  t: "Property documents",
                  items: ["Builder buyer agreement or sale deed", "Approved building plan", "RERA registration details", "Chain of title for resale"],
                },
              ].map((block) => (
                <div key={block.t}>
                  <h3 className="text-[14.5px] font-semibold text-[color:var(--gp-ink)]">{block.t}</h3>
                  <ul className="mt-2.5 space-y-1.5">
                    {block.items.map((i) => (
                      <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                        <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--gp-gold-600)]" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}

/* ────────────────────────────────────────── faceted internal links */

export function RelatedAmountsV2({
  current,
  p,
  lender,
}: {
  current?: LoanAmount;
  p: (path: string) => string;
  lender?: Lender;
}) {
  return (
    <GpSection tone="cream" className="pt-0">
      <GpContainer>
        <h2 className="font-display text-[21px] text-[color:var(--gp-ink)]">
          {lender ? `${lender.name} home loan by amount` : "Home loan EMI by amount"}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {LOAN_AMOUNTS.map((a) => {
            const href = lender
              ? p(`/home-loan/${lender.slug}/${amountSlugStem(a)}`)
              : p(`/home-loan/${a.slug}`);
            const isCurrent = current?.slug === a.slug;
            return (
              <Link
                key={a.slug}
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                  isCurrent
                    ? "border-[color:var(--gp-gold-600)] bg-[color:var(--gp-gold-600)] text-[color:var(--gp-forest-950)]"
                    : "border-[color:var(--gp-border)] bg-white text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)]"
                }`}
              >
                {a.label}
              </Link>
            );
          })}
        </div>

        <h2 className="font-display mt-10 text-[21px] text-[color:var(--gp-ink)]">
          Home loan by lender
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {LENDERS.map((l) => (
            <Link
              key={l.slug}
              href={p(`/home-loan/${l.slug}`)}
              aria-current={lender?.slug === l.slug ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                lender?.slug === l.slug
                  ? "border-[color:var(--gp-gold-600)] bg-[color:var(--gp-gold-600)] text-[color:var(--gp-forest-950)]"
                  : "border-[color:var(--gp-border)] bg-white text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)]"
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>
      </GpContainer>
    </GpSection>
  );
}
