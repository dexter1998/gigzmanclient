"use client";

import { useMemo, useState } from "react";
import { calculateRentalYield } from "@/lib/calculators/rental-yield";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface RentalYieldCalculatorProps {
  calculatorKey: string;
  version: string;
  taxYear: string | null;
  initial?: { propertyValue?: string; monthlyRent?: string };
}

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

export default function RentalYieldCalculator({
  calculatorKey,
  version,
  taxYear,
  initial,
}: RentalYieldCalculatorProps) {
  const [propertyValue, setPropertyValue] = useState(initial?.propertyValue ?? "");
  const [monthlyRent, setMonthlyRent] = useState(initial?.monthlyRent ?? "");
  const [started, setStarted] = useState(false);
  const [computed, setComputed] = useState(Boolean(initial?.propertyValue));

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart(calculatorKey, version);
  };

  const numericValue = Number(propertyValue.replace(/[^\d.]/g, "")) || 0;
  const numericRent = Number(monthlyRent.replace(/[^\d.]/g, "")) || 0;

  const result = useMemo(
    () => calculateRentalYield({ propertyValue: numericValue, monthlyRent: numericRent }),
    [numericValue, numericRent],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="ry-value" className="mb-1.5 block text-[13px] text-ink-muted">
            Property value
          </label>
          <input
            id="ry-value"
            type="text"
            inputMode="numeric"
            value={propertyValue}
            onChange={(e) => {
              touch();
              setPropertyValue(e.target.value);
            }}
            placeholder="0"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="ry-rent" className="mb-1.5 block text-[13px] text-ink-muted">
            Expected monthly rent
          </label>
          <input
            id="ry-rent"
            type="text"
            inputMode="numeric"
            value={monthlyRent}
            onChange={(e) => {
              touch();
              setMonthlyRent(e.target.value);
            }}
            placeholder="0"
            className={FIELD}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setComputed(true);
            if (numericValue > 0) analytics.calculatorComplete(calculatorKey, taxYear);
          }}
          className="min-h-[46px] w-full rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
        >
          Calculate Yield
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[12px] bg-navy text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[13px] font-semibold">Rental yield</p>
          </div>

          {!computed || numericValue <= 0 || numericRent <= 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/55">
              Enter both values and select Calculate Yield.
            </p>
          ) : (
            <div className="space-y-3 px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[8px] bg-accent/20 px-3.5 py-3">
                  <p className="text-[11px] text-white/60">Gross yield</p>
                  <p className="mt-0.5 text-[18px] font-semibold tabular-nums">
                    {result.grossYieldPercent}%
                  </p>
                </div>
                <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                  <p className="text-[11px] text-white/50">Net yield</p>
                  <p className="mt-0.5 text-[18px] font-semibold tabular-nums">
                    {result.netYieldPercent}%
                  </p>
                </div>
              </div>
              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Annual rent</p>
                <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                  {formatInr(result.annualRent, true)}
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-white/50">
                Net yield deducts an assumed expense ratio for maintenance, property tax and
                vacancy — not actual costs.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
