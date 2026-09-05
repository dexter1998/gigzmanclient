"use client";

import { useMemo, useState } from "react";
import { calculateStampDuty, type OwnerCategory, STAMP_DUTY_VERSION } from "@/lib/calculators/stamp-duty";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { joinPath } from "@/lib/paths";
import { GpEyebrow, cn } from "./gp-primitives";

interface StampDutyPanelV2Props {
  basePath: string;
}

const FIELD_DARK =
  "min-h-[46px] w-full rounded-[var(--gp-radius-sm)] border border-white/15 bg-white/[0.06] px-3.5 text-[13.5px] text-white placeholder:text-white/35 transition-colors focus:border-[color:var(--gp-gold-300)] focus:outline-none";

const LABEL_DARK = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50";

const OWNER_OPTIONS: { value: OwnerCategory; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "joint", label: "Joint" },
];

export default function StampDutyPanelV2({ basePath }: StampDutyPanelV2Props) {
  const p = (path: string) => joinPath(basePath, path);
  const disclaimerHref = p("/legal/calculator-disclaimer");

  const [propertyValue, setPropertyValue] = useState("");
  const [ownerCategory, setOwnerCategory] = useState<OwnerCategory>("male");
  const [started, setStarted] = useState(false);

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart("stamp-duty", STAMP_DUTY_VERSION);
  };

  const numericValue = Number(propertyValue.replace(/[^\d.]/g, "")) || 0;

  const result = useMemo(
    () => calculateStampDuty({ propertyValue: numericValue, ownerCategory }),
    [numericValue, ownerCategory],
  );

  const hasResult = numericValue > 0;

  return (
    <div
      className="flex flex-col rounded-[var(--gp-radius-lg)] p-7 text-white"
      style={{ background: "var(--gp-gradient-dark-section)" }}
    >
      <GpEyebrow className="text-[color:var(--gp-gold-300)]">Stamp Duty Calculator</GpEyebrow>
      <h3 className="font-display mt-2 text-[24px] text-white">Estimate Registration Costs</h3>

      <div className="mt-6 space-y-4">
        <div>
          <label className={LABEL_DARK} htmlFor="gp-sd-value">
            Property Value (₹)
          </label>
          <input
            id="gp-sd-value"
            type="text"
            inputMode="numeric"
            value={propertyValue}
            onFocus={touch}
            onChange={(e) => setPropertyValue(e.target.value)}
            className={FIELD_DARK}
            placeholder="e.g. 7500000"
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
            Use the agreement value or the circle rate, whichever is higher.
          </p>
        </div>

        <div>
          <p className={LABEL_DARK}>Owner Category</p>
          <div className="flex flex-wrap gap-2">
            {OWNER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  touch();
                  setOwnerCategory(option.value);
                }}
                aria-pressed={ownerCategory === option.value}
                className={cn(
                  "min-h-[36px] rounded-[var(--gp-radius-sm)] px-3 text-[12.5px] font-medium transition-colors",
                  ownerCategory === option.value
                    ? "bg-[color:var(--gp-gold-600)] text-[color:var(--gp-forest-950)]"
                    : "border border-white/20 text-white/70 hover:border-[color:var(--gp-gold-300)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
            Rebates for a sole female owner or joint registration vary by state and change over
            time.
          </p>
        </div>

        <div
          className="rounded-[var(--gp-radius-md)] px-5 py-4"
          onClick={() => {
            if (hasResult) analytics.calculatorComplete("stamp-duty", null);
          }}
        >
          <div className="rounded-[var(--gp-radius-sm)] bg-white/[0.06] px-4 py-3.5">
            <p className="text-[11px] uppercase tracking-[0.08em] text-white/50">Total Payable</p>
            <p className="font-sans mt-1 text-[30px] font-semibold text-[color:var(--gp-gold-300)]">
              {hasResult ? formatInr(result.totalPayable) : "—"}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-white/45">Stamp Duty ({result.ratePercent}%)</p>
              <p className="mt-0.5 text-[13.5px] font-medium tabular-nums text-white/85">
                {hasResult ? formatInr(result.stampDuty) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/45">Registration Fee</p>
              <p className="mt-0.5 text-[13.5px] font-medium tabular-nums text-white/85">
                {hasResult ? formatInr(result.registrationFee) : "—"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-white/40">
          Excludes GST on under-construction properties, brokerage and legal fees, and does not
          classify the transaction type. Rates shown are illustrative pending professional
          verification.{" "}
          <a href={disclaimerHref} className="underline underline-offset-2 hover:text-white/70">
            Read the disclaimer
          </a>
        </p>
      </div>
    </div>
  );
}
