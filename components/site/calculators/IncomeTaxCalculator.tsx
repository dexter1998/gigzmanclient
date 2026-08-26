"use client";

import { useMemo, useState } from "react";
import { calculateIncomeTax, type AgeCategory, type RegimeResult } from "@/lib/calculators/income-tax";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface IncomeTaxCalculatorProps {
  calculatorKey: string;
  version: string;
  taxYear: string;
}

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

const INCOME_FIELDS = [
  { name: "salaryIncome", label: "Salary income" },
  { name: "housePropertyIncome", label: "House property income" },
  { name: "businessIncome", label: "Business or professional income" },
  { name: "capitalGains", label: "Capital gains" },
  { name: "otherIncome", label: "Other income" },
] as const;

const DEDUCTION_FIELDS = [
  { name: "section80C", label: "Section 80C", hint: "Limit 1,50,000" },
  { name: "section80D", label: "Section 80D", hint: "Health insurance" },
  { name: "section80CCD1B", label: "Section 80CCD(1B)", hint: "Limit 50,000" },
  { name: "interestDeduction", label: "Interest on housing loan", hint: "Old regime" },
] as const;

type NumericField =
  | (typeof INCOME_FIELDS)[number]["name"]
  | (typeof DEDUCTION_FIELDS)[number]["name"]
  | "taxPaid";

const EMPTY: Record<NumericField, string> = {
  salaryIncome: "",
  housePropertyIncome: "",
  businessIncome: "",
  capitalGains: "",
  otherIncome: "",
  section80C: "",
  section80D: "",
  section80CCD1B: "",
  interestDeduction: "",
  taxPaid: "",
};

export default function IncomeTaxCalculator({
  calculatorKey,
  version,
  taxYear,
}: IncomeTaxCalculatorProps) {
  const [values, setValues] = useState(EMPTY);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("general");
  const [started, setStarted] = useState(false);
  const [computed, setComputed] = useState(false);

  const num = (key: NumericField) => Number(values[key].replace(/[^\d.-]/g, "")) || 0;

  const set = (key: NumericField, value: string) => {
    if (!started) {
      setStarted(true);
      analytics.calculatorStart(calculatorKey, version);
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      calculateIncomeTax({
        ageCategory,
        salaryIncome: num("salaryIncome"),
        housePropertyIncome: num("housePropertyIncome"),
        businessIncome: num("businessIncome"),
        capitalGains: num("capitalGains"),
        otherIncome: num("otherIncome"),
        section80C: num("section80C"),
        section80D: num("section80D"),
        section80CCD1B: num("section80CCD1B"),
        interestDeduction: num("interestDeduction"),
        taxPaid: num("taxPaid"),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, ageCategory],
  );

  const hasIncome = result.oldRegime.grossIncome > 0;

  const onCalculate = () => {
    setComputed(true);
    if (hasIncome) analytics.calculatorComplete(calculatorKey, taxYear);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-7">
        <fieldset>
          <legend className="text-[14px] font-semibold text-ink">Taxpayer</legend>
          <div className="mt-3">
            <label htmlFor="ageCategory" className="mb-1.5 block text-[13px] text-ink-muted">
              Age category
            </label>
            <select
              id="ageCategory"
              value={ageCategory}
              onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
              className={FIELD}
            >
              <option value="general">Below 60 years</option>
              <option value="senior">60 years or above, below 80</option>
              <option value="superSenior">80 years or above</option>
            </select>
            <p className="mt-1.5 text-[11px] text-ink-subtle">
              Affects the basic exemption limit under the old regime only.
            </p>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[14px] font-semibold text-ink">Income</legend>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INCOME_FIELDS.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-1.5 block text-[13px] text-ink-muted">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type="text"
                  inputMode="numeric"
                  value={values[field.name]}
                  onChange={(e) => set(field.name, e.target.value)}
                  placeholder="0"
                  className={FIELD}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[14px] font-semibold text-ink">Deductions</legend>
          <p className="mt-1 text-[12px] text-ink-subtle">
            These apply under the old regime only and are ignored in the new regime computation.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DEDUCTION_FIELDS.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-1.5 block text-[13px] text-ink-muted">
                  {field.label}
                  <span className="ml-1 text-[11px] text-ink-subtle">({field.hint})</span>
                </label>
                <input
                  id={field.name}
                  type="text"
                  inputMode="numeric"
                  value={values[field.name]}
                  onChange={(e) => set(field.name, e.target.value)}
                  placeholder="0"
                  className={FIELD}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[14px] font-semibold text-ink">Tax already paid</legend>
          <div className="mt-3 sm:max-w-[50%]">
            <label htmlFor="taxPaid" className="mb-1.5 block text-[13px] text-ink-muted">
              TDS, TCS and advance tax
            </label>
            <input
              id="taxPaid"
              type="text"
              inputMode="numeric"
              value={values.taxPaid}
              onChange={(e) => set("taxPaid", e.target.value)}
              placeholder="0"
              className={FIELD}
            />
          </div>
        </fieldset>

        <button
          type="button"
          onClick={onCalculate}
          className="min-h-[46px] w-full rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
        >
          Calculate Estimate
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[12px] bg-navy text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[13px] font-semibold">Tax summary</p>
            <p className="mt-0.5 text-[11px] text-white/50">{taxYear}</p>
          </div>

          {!computed || !hasIncome ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/55">
              Enter income details and select Calculate Estimate.
            </p>
          ) : (
            <div className="px-5 py-4">
              <Row label="Gross income" value={result.oldRegime.grossIncome} muted />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <RegimePanel title="Old regime" data={result.oldRegime} />
                <RegimePanel title="New regime" data={result.newRegime} highlight />
              </div>

              <div className="mt-4 rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Difference between regimes</p>
                <p className="mt-0.5 text-[16px] font-semibold">{formatInr(result.difference)}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
                  Both are shown for comparison. Regime selection depends on factors this
                  calculator does not capture and is a matter for professional advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={`text-[12px] ${muted ? "text-white/50" : "text-white/70"}`}>{label}</span>
      <span className="text-[14px] font-medium tabular-nums">{formatInr(value)}</span>
    </div>
  );
}

function RegimePanel({
  title,
  data,
  highlight,
}: {
  title: string;
  data: RegimeResult;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-[8px] p-3.5 ${highlight ? "bg-accent/20" : "bg-white/[0.06]"}`}>
      <p className="text-[11px] text-white/55">{title}</p>
      <p className="mt-1.5 text-[18px] font-semibold tabular-nums">{formatInr(data.totalTax)}</p>
      <dl className="mt-3 space-y-1.5 text-[11px]">
        <Detail label="Taxable" value={data.taxableIncome} />
        <Detail label="Rebate" value={data.rebate} />
        <Detail label="Surcharge" value={data.surcharge} />
        <Detail label="Cess" value={data.cess} />
        <div className="border-t border-white/10 pt-1.5">
          <Detail label={data.balance >= 0 ? "Balance payable" : "Excess paid"} value={Math.abs(data.balance)} />
        </div>
      </dl>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-white/45">{label}</dt>
      <dd className="tabular-nums text-white/80">{formatInr(value)}</dd>
    </div>
  );
}
