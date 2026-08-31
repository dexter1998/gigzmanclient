"use client";

import { useMemo, useState } from "react";
import { calculateStampDuty, type OwnerCategory } from "@/lib/calculators/stamp-duty";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface StampDutyCalculatorProps {
  calculatorKey: string;
  version: string;
  taxYear: string | null;
  initial?: { propertyValue?: string; ownerCategory?: OwnerCategory };
}

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

const OWNER_OPTIONS: { value: OwnerCategory; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "joint", label: "Joint" },
];

export default function StampDutyCalculator({
  calculatorKey,
  version,
  taxYear,
  initial,
}: StampDutyCalculatorProps) {
  const [propertyValue, setPropertyValue] = useState(initial?.propertyValue ?? "");
  const [ownerCategory, setOwnerCategory] = useState<OwnerCategory>(initial?.ownerCategory ?? "male");
  const [started, setStarted] = useState(false);
  const [computed, setComputed] = useState(Boolean(initial?.propertyValue));

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart(calculatorKey, version);
  };

  const numericValue = Number(propertyValue.replace(/[^\d.]/g, "")) || 0;

  const result = useMemo(
    () => calculateStampDuty({ propertyValue: numericValue, ownerCategory }),
    [numericValue, ownerCategory],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="property-value" className="mb-1.5 block text-[13px] text-ink-muted">
            Property value (agreement or circle rate, whichever is higher)
          </label>
          <input
            id="property-value"
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

        <fieldset>
          <legend className="mb-2 text-[13px] text-ink-muted">Owner category</legend>
          <div className="grid grid-cols-3 gap-2">
            {OWNER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  touch();
                  setOwnerCategory(option.value);
                }}
                aria-pressed={ownerCategory === option.value}
                className={`min-h-[44px] rounded-[8px] border px-3 text-[13px] transition-colors ${
                  ownerCategory === option.value
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
            Rebates for a sole female owner or a joint male-female registration vary by state and
            change from time to time — confirm the rate applicable before relying on this estimate.
          </p>
        </fieldset>

        <button
          type="button"
          onClick={() => {
            setComputed(true);
            if (numericValue > 0) analytics.calculatorComplete(calculatorKey, taxYear);
          }}
          className="min-h-[46px] w-full rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
        >
          Calculate Estimate
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[12px] bg-navy text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[13px] font-semibold">Stamp duty & registration</p>
            <p className="mt-0.5 text-[11px] text-white/50">
              {result.ratePercent}% stamp duty · {OWNER_OPTIONS.find((o) => o.value === ownerCategory)?.label}
            </p>
          </div>

          {!computed || numericValue <= 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/55">
              Enter a property value and select Calculate Estimate.
            </p>
          ) : (
            <div className="space-y-3 px-5 py-4">
              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Stamp duty</p>
                <p className="mt-0.5 text-[16px] font-semibold tabular-nums">
                  {formatInr(result.stampDuty, true)}
                </p>
              </div>
              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Registration fee</p>
                <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                  {formatInr(result.registrationFee, true)}
                </p>
              </div>
              <div className="rounded-[8px] bg-accent/20 px-3.5 py-3">
                <p className="text-[11px] text-white/60">Total payable</p>
                <p className="mt-0.5 text-[20px] font-semibold tabular-nums">
                  {formatInr(result.totalPayable, true)}
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-white/50">
                Excludes GST on under-construction properties, brokerage and legal fees.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
