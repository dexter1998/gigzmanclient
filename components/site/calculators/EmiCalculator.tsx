"use client";

import { useMemo, useState } from "react";
import { calculateEmi } from "@/lib/calculators/emi";
import { EMI_RATE_PRESETS, EMI_TENURE_PRESETS_YEARS } from "@/lib/calculators/rates/gurugram-2026";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface EmiCalculatorProps {
  calculatorKey: string;
  version: string;
  taxYear: string | null;
  initial?: { principal?: string; rate?: number; tenureYears?: number };
}

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

export default function EmiCalculator({ calculatorKey, version, taxYear, initial }: EmiCalculatorProps) {
  const [principal, setPrincipal] = useState(initial?.principal ?? "");
  const [rate, setRate] = useState(initial?.rate ?? EMI_RATE_PRESETS[1]);
  const [tenureYears, setTenureYears] = useState(initial?.tenureYears ?? 20);
  const [started, setStarted] = useState(false);
  const [computed, setComputed] = useState(Boolean(initial?.principal));

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart(calculatorKey, version);
  };

  const numericPrincipal = Number(principal.replace(/[^\d.]/g, "")) || 0;

  const result = useMemo(
    () => calculateEmi({ principal: numericPrincipal, annualRatePercent: rate, tenureYears }),
    [numericPrincipal, rate, tenureYears],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="principal" className="mb-1.5 block text-[13px] text-ink-muted">
            Loan amount
          </label>
          <input
            id="principal"
            type="text"
            inputMode="numeric"
            value={principal}
            onChange={(e) => {
              touch();
              setPrincipal(e.target.value);
            }}
            placeholder="0"
            className={FIELD}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-[13px] text-ink-muted">Interest rate (per annum)</legend>
          <div className="flex flex-wrap gap-2">
            {EMI_RATE_PRESETS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  touch();
                  setRate(option);
                }}
                aria-pressed={rate === option}
                className={`min-h-[40px] min-w-[64px] rounded-[8px] border px-3 text-[13px] transition-colors ${
                  rate === option
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                }`}
              >
                {option}%
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
            Illustrative presets, not a rate quote. The rate actually sanctioned depends on the
            lender, loan amount and the borrower&rsquo;s profile.
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[13px] text-ink-muted">Tenure</legend>
          <div className="flex flex-wrap gap-2">
            {EMI_TENURE_PRESETS_YEARS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  touch();
                  setTenureYears(option);
                }}
                aria-pressed={tenureYears === option}
                className={`min-h-[40px] min-w-[56px] rounded-[8px] border px-3 text-[13px] transition-colors ${
                  tenureYears === option
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                }`}
              >
                {option} yr
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => {
            setComputed(true);
            if (numericPrincipal > 0) analytics.calculatorComplete(calculatorKey, taxYear);
          }}
          className="min-h-[46px] w-full rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
        >
          Calculate EMI
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[12px] bg-navy text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[13px] font-semibold">EMI breakdown</p>
            <p className="mt-0.5 text-[11px] text-white/50">
              {rate}% · {tenureYears} year{tenureYears === 1 ? "" : "s"}
            </p>
          </div>

          {!computed || numericPrincipal <= 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/55">
              Enter a loan amount and select Calculate EMI.
            </p>
          ) : (
            <div className="space-y-3 px-5 py-4">
              <div className="rounded-[8px] bg-accent/20 px-3.5 py-3">
                <p className="text-[11px] text-white/60">Monthly EMI</p>
                <p className="mt-0.5 text-[20px] font-semibold tabular-nums">
                  {formatInr(result.monthlyEmi, true)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                  <p className="text-[11px] text-white/50">Total interest</p>
                  <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                    {formatInr(result.totalInterest, true)}
                  </p>
                </div>
                <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                  <p className="text-[11px] text-white/50">Total payment</p>
                  <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                    {formatInr(result.totalPayment, true)}
                  </p>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-white/50">
                Reducing-balance method. Excludes processing fees, insurance and prepayment.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
