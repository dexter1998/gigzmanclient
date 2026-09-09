"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Percent, PieChart } from "lucide-react";
import { calculateEmi } from "@/lib/calculators/emi";
import { EMI_TENURE_PRESETS_YEARS } from "@/lib/calculators/rates/gurugram-2026";
import { formatInr, formatIndianPrice } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { GpContainer } from "../gp-primitives";
import LineArtBackdropV2 from "../LineArtBackdropV2";
import { openLeadPopup, type LeadIntentKey } from "../leadPopup";

const FIELD =
  "w-full bg-transparent text-[17px] font-semibold text-[color:var(--gp-ink)] focus:outline-none";
const FIELD_WRAP =
  "rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white px-4 py-3 transition-colors focus-within:border-[color:var(--gp-gold-600)]";
const FIELD_LABEL = "block text-[12px] text-[color:var(--gp-muted)]";

/** Parse a rupee string that may carry Indian digit grouping. */
function toNumber(raw: string): number {
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function EmiCalculatorHeroV2({
  heading,
  subheading,
  initialPrice,
  initialDownPayment,
  initialRate = 8.5,
  initialTenure = 20,
  breadcrumb,
  intentKey = "homeLoan",
}: {
  heading: string;
  subheading: string;
  initialPrice: number;
  initialDownPayment: number;
  initialRate?: number;
  initialTenure?: number;
  breadcrumb?: React.ReactNode;
  intentKey?: LeadIntentKey;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [down, setDown] = useState(initialDownPayment);
  const [rate, setRate] = useState(initialRate);
  const [tenure, setTenure] = useState(initialTenure);
  const [touched, setTouched] = useState(false);

  const loanAmount = Math.max(0, price - down);

  const result = useMemo(
    () => calculateEmi({ principal: loanAmount, annualRatePercent: rate, tenureYears: tenure }),
    [loanAmount, rate, tenure],
  );

  const interestShare =
    result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 0;

  // Donut geometry — a plain two-segment ring, so an inline SVG is lighter
  // than pulling in a chart library for one figure.
  const RADIUS = 78;
  const CIRC = 2 * Math.PI * RADIUS;
  const principalDash = result.totalPayment > 0 ? (result.principal / result.totalPayment) * CIRC : 0;

  const touch = () => {
    if (touched) return;
    setTouched(true);
    analytics.calculatorStart("home-loan-emi", "hero");
  };

  return (
    <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ background: "var(--gp-gradient-glow)" }}
      />
      <LineArtBackdropV2 variant="blueprint-wide" />
      <GpContainer className="relative py-12 sm:py-16">
        {breadcrumb ? <div className="mb-6 text-center">{breadcrumb}</div> : null}

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="gp-hero-title font-display text-white">{heading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            {subheading}
          </p>
        </div>

        <div
          className="mt-10 grid grid-cols-1 overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-gold-600)]/35 lg:grid-cols-2"
          style={{ boxShadow: "0 30px 70px -30px rgba(0,0,0,0.6)" }}
        >
          {/* ── Inputs ─────────────────────────────────────────────── */}
          <div className="bg-[color:var(--gp-cream-100)] p-6 sm:p-8">
            <h2 className="font-display text-[16px] text-[color:var(--gp-ink)] sm:text-[19px]">
              Enter financing details
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_WRAP}>
                <label className={FIELD_LABEL} htmlFor="hl-price">
                  Home price
                </label>
                <input
                  id="hl-price"
                  inputMode="numeric"
                  className={FIELD}
                  value={formatInr(price)}
                  onFocus={touch}
                  onChange={(e) => setPrice(toNumber(e.target.value))}
                />
              </div>

              <div className={FIELD_WRAP}>
                <label className={FIELD_LABEL} htmlFor="hl-down">
                  Down payment
                </label>
                <input
                  id="hl-down"
                  inputMode="numeric"
                  className={FIELD}
                  value={formatInr(down)}
                  onFocus={touch}
                  onChange={(e) => setDown(Math.min(toNumber(e.target.value), price))}
                />
              </div>

              <div className={FIELD_WRAP}>
                <label className={FIELD_LABEL} htmlFor="hl-rate">
                  Interest rate
                </label>
                <div className="flex items-baseline gap-1">
                  <input
                    id="hl-rate"
                    inputMode="decimal"
                    className={FIELD}
                    value={rate.toFixed(2)}
                    onFocus={touch}
                    onChange={(e) => setRate(Math.min(20, Math.max(0, toNumber(e.target.value))))}
                  />
                  <span className="text-[15px] font-semibold text-[color:var(--gp-ink)]">%</span>
                </div>
              </div>

              <div className={FIELD_WRAP}>
                <label className={FIELD_LABEL} htmlFor="hl-tenure">
                  Tenure
                </label>
                <select
                  id="hl-tenure"
                  className={`${FIELD} cursor-pointer`}
                  value={tenure}
                  onFocus={touch}
                  onChange={(e) => setTenure(Number(e.target.value))}
                >
                  {EMI_TENURE_PRESETS_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y} years
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white px-4 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Loan amount</span>
                <span className="font-sans text-[16px] font-semibold text-[color:var(--gp-gold-600)]">
                  {formatIndianPrice(loanAmount)}
                </span>
              </div>
              <label className="sr-only" htmlFor="hl-loan">
                Loan amount
              </label>
              <input
                id="hl-loan"
                type="range"
                min={0}
                max={price}
                step={100000}
                value={loanAmount}
                onChange={(e) => setDown(price - Number(e.target.value))}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--gp-cream-200)] accent-[color:var(--gp-gold-600)]"
              />
            </div>

            {/* The estimate updates live as you type, so this button is not
                doing the sum — it hands the finished numbers to an advisor,
                which is the actual conversion step on these pages. */}
            <button
              type="button"
              onClick={() => {
                analytics.calculatorComplete("home-loan-emi", null);
                openLeadPopup(intentKey);
              }}
              className="mt-5 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-bold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              Calculate EMI
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="mt-2.5 text-center text-[12px] text-[color:var(--gp-muted)]">
              Get this reviewed by an advisor — no obligation.
            </p>
          </div>

          {/* ── Estimate ───────────────────────────────────────────── */}
          <div className="bg-[image:var(--gp-gradient-dark-section)] p-6 sm:p-8">
            <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Your estimate</p>

            <p className="font-display mt-3 text-[25px] leading-none text-white sm:text-[31px]">
              <span className="font-sans font-semibold">{formatInr(Math.round(result.monthlyEmi))}</span>{" "}
              <span className="text-[20px] sm:text-[24px]">monthly EMI</span>
            </p>

            <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row">
              <svg viewBox="0 0 200 200" className="h-[168px] w-[168px] shrink-0 -rotate-90" role="img" aria-label={`Principal ${formatIndianPrice(result.principal)}, interest ${formatIndianPrice(result.totalInterest)}`}>
                <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="var(--gp-gold-600)" strokeWidth="22" />
                <circle
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--gp-forest-900)"
                  strokeWidth="22"
                  strokeDasharray={`${principalDash} ${CIRC - principalDash}`}
                />
                <g className="rotate-90" style={{ transformOrigin: "100px 100px" }}>
                  <text x="100" y="96" textAnchor="middle" className="fill-white font-sans text-[19px] font-semibold">
                    {formatIndianPrice(result.totalPayment)}
                  </text>
                  <text x="100" y="116" textAnchor="middle" className="fill-white/55 font-sans text-[11px] tracking-[0.12em]">
                    TOTAL
                  </text>
                </g>
              </svg>

              <dl className="w-full space-y-3">
                {[
                  { label: "Principal", value: result.principal, dot: "var(--gp-forest-700)" },
                  { label: "Total interest", value: result.totalInterest, dot: "var(--gp-gold-600)" },
                  { label: "Total payable", value: result.totalPayment, dot: "transparent" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="flex items-center gap-2.5 text-[13.5px] text-white/75">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: row.dot }}
                      />
                      {row.label}
                    </dt>
                    <dd className="font-sans text-[15px] font-semibold text-white">
                      {formatIndianPrice(row.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="font-display mt-7 text-[15px] text-white">Repayment details</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { icon: Percent, label: "Rate", value: `${rate.toFixed(2)}%` },
                { icon: Calendar, label: "Tenure", value: `${tenure * 12} months` },
                { icon: PieChart, label: "Interest share", value: `${interestShare.toFixed(1)}%` },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="border-l border-white/12 pl-3 first:border-l-0 first:pl-0">
                    <Icon className="h-4 w-4 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                    <p className="mt-1.5 text-[11px] text-white/55">{stat.label}</p>
                    <p className="font-sans text-[14px] font-semibold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Sits under the finished numbers rather than beside the inputs:
                by this point the visitor has an EMI they believe, which is
                the moment the loan ask converts. */}
            <button
              type="button"
              onClick={() => {
                analytics.calculatorComplete("home-loan-emi", null);
                openLeadPopup("bank");
              }}
              className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-bold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              Apply for loan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-white/50">
              An advisor checks your eligibility with our lender panel. No fee, no obligation.
            </p>
          </div>
        </div>
      </GpContainer>
    </section>
  );
}
