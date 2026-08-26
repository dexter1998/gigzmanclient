"use client";

import { useMemo, useState } from "react";
import { calculateGst, GST_RATES, type AmountType, type SupplyType } from "@/lib/calculators/gst";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface GstCalculatorProps {
  calculatorKey: string;
  version: string;
  taxYear: string;
}

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

export default function GstCalculator({ calculatorKey, version, taxYear }: GstCalculatorProps) {
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<AmountType>("exclusive");
  const [ratePercent, setRatePercent] = useState(18);
  const [supplyType, setSupplyType] = useState<SupplyType>("intra_state");
  const [started, setStarted] = useState(false);
  const [computed, setComputed] = useState(false);

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart(calculatorKey, version);
  };

  const numericAmount = Number(amount.replace(/[^\d.]/g, "")) || 0;

  const result = useMemo(
    () => calculateGst({ amount: numericAmount, amountType, ratePercent, supplyType }),
    [numericAmount, amountType, ratePercent, supplyType],
  );

  const isIntraState = supplyType === "intra_state";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="amount" className="mb-1.5 block text-[13px] text-ink-muted">
            Amount
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              touch();
              setAmount(e.target.value);
            }}
            placeholder="0"
            className={FIELD}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-[13px] text-ink-muted">The amount entered is</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "exclusive", label: "Exclusive of GST" },
                { value: "inclusive", label: "Inclusive of GST" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  touch();
                  setAmountType(option.value);
                }}
                aria-pressed={amountType === option.value}
                className={`min-h-[44px] rounded-[8px] border px-3 text-[13px] transition-colors ${
                  amountType === option.value
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[13px] text-ink-muted">GST rate</legend>
          <div className="flex flex-wrap gap-2">
            {GST_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  touch();
                  setRatePercent(rate);
                }}
                aria-pressed={ratePercent === rate}
                className={`min-h-[40px] min-w-[56px] rounded-[8px] border px-3 text-[13px] transition-colors ${
                  ratePercent === rate
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
            Select the rate applicable to your supply. This calculator does not classify goods or
            services and does not determine the applicable rate or HSN/SAC code.
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[13px] text-ink-muted">Supply type</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "intra_state", label: "Intra-state", hint: "CGST + SGST" },
                { value: "inter_state", label: "Inter-state", hint: "IGST" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  touch();
                  setSupplyType(option.value);
                }}
                aria-pressed={supplyType === option.value}
                className={`min-h-[52px] rounded-[8px] border px-3 text-left transition-colors ${
                  supplyType === option.value
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                }`}
              >
                <span className="block text-[13px] font-medium">{option.label}</span>
                <span className="block text-[11px] opacity-70">{option.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => {
            setComputed(true);
            if (numericAmount > 0) analytics.calculatorComplete(calculatorKey, taxYear);
          }}
          className="min-h-[46px] w-full rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
        >
          Calculate Estimate
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[12px] bg-navy text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[13px] font-semibold">GST breakdown</p>
            <p className="mt-0.5 text-[11px] text-white/50">
              {ratePercent}% · {isIntraState ? "Intra-state" : "Inter-state"}
            </p>
          </div>

          {!computed || numericAmount <= 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/55">
              Enter an amount and select Calculate Estimate.
            </p>
          ) : (
            <div className="space-y-3 px-5 py-4">
              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Base amount</p>
                <p className="mt-0.5 text-[16px] font-semibold tabular-nums">
                  {formatInr(result.baseAmount, true)}
                </p>
              </div>

              {isIntraState ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                    <p className="text-[11px] text-white/50">CGST</p>
                    <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                      {formatInr(result.cgst, true)}
                    </p>
                  </div>
                  <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                    <p className="text-[11px] text-white/50">SGST</p>
                    <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                      {formatInr(result.sgst, true)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                  <p className="text-[11px] text-white/50">IGST</p>
                  <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                    {formatInr(result.igst, true)}
                  </p>
                </div>
              )}

              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Total GST</p>
                <p className="mt-0.5 text-[14px] font-medium tabular-nums">
                  {formatInr(result.totalGst, true)}
                </p>
              </div>

              <div className="rounded-[8px] bg-accent/20 px-3.5 py-3">
                <p className="text-[11px] text-white/60">Total amount</p>
                <p className="mt-0.5 text-[20px] font-semibold tabular-nums">
                  {formatInr(result.totalAmount, true)}
                </p>
              </div>

              <p className="text-[11px] leading-relaxed text-white/50">
                {isIntraState
                  ? "Intra-state supply: tax is split equally between CGST and SGST."
                  : "Inter-state supply: the full amount is charged as IGST."}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
