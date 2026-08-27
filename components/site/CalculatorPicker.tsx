"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Receipt, FileSpreadsheet, Percent, Check } from "lucide-react";
import { TDS_SECTIONS } from "@/lib/calculators/tds";
import { GST_RATES } from "@/lib/calculators/gst";
import { analytics } from "@/lib/analytics";

interface CalculatorSummary {
  key: string;
  title: string;
  description: string | null;
  taxYear: string;
  version: string;
  status: string;
}

interface CalculatorPickerProps {
  calculators: CalculatorSummary[];
  /** Base path for `/calculators/{key}`. */
  calculatorsHref: string;
}

const ICONS: Record<string, typeof Receipt> = {
  "income-tax": Receipt,
  tds: FileSpreadsheet,
  gst: Percent,
};

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

const LABEL = "mb-1.5 block text-[13px] text-ink-muted";

/**
 * Picker on the left, the selected calculator's key inputs on the right.
 *
 * Submitting carries the entered values to the full calculator page as query
 * parameters, where the form arrives prefilled and the result is already shown.
 * Figures travel in the URL only — they are never sent to the firm or into
 * analytics.
 */
export default function CalculatorPicker({
  calculators,
  calculatorsHref,
}: CalculatorPickerProps) {
  const router = useRouter();
  const available = calculators.filter((c) => c.status !== "archived");
  const [activeKey, setActiveKey] = useState(available[0]?.key ?? "income-tax");

  const [salary, setSalary] = useState("");
  const [deductions, setDeductions] = useState("");
  const [ageCategory, setAgeCategory] = useState("general");

  const [section, setSection] = useState(TDS_SECTIONS[0].code);
  const [payment, setPayment] = useState("");
  const [panAvailable, setPanAvailable] = useState(true);

  const [gstAmount, setGstAmount] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [amountType, setAmountType] = useState("exclusive");

  const active = available.find((c) => c.key === activeKey);
  if (!active) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ prefilled: "1" });

    if (activeKey === "income-tax") {
      if (salary) params.set("salary", salary.replace(/[^\d.]/g, ""));
      if (deductions) params.set("deductions", deductions.replace(/[^\d.]/g, ""));
      params.set("age", ageCategory);
    } else if (activeKey === "tds") {
      params.set("section", section);
      if (payment) params.set("payment", payment.replace(/[^\d.]/g, ""));
      params.set("pan", panAvailable ? "1" : "0");
    } else if (activeKey === "gst") {
      if (gstAmount) params.set("amount", gstAmount.replace(/[^\d.]/g, ""));
      params.set("rate", String(gstRate));
      params.set("type", amountType);
    }

    analytics.calculatorStart(activeKey, active.version);
    router.push(`${calculatorsHref}/${activeKey}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-6">
      {/* Picker */}
      <ul className="space-y-3">
        {available.map((calc) => {
          const Icon = ICONS[calc.key] ?? Receipt;
          const selected = calc.key === activeKey;
          return (
            <li key={calc.key}>
              <button
                type="button"
                onClick={() => setActiveKey(calc.key)}
                aria-pressed={selected}
                className={`flex w-full items-start gap-3.5 rounded-[12px] border p-4 text-left transition-all ${
                  selected
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface hover:border-navy-muted"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] ${
                    selected ? "bg-accent text-white" : "bg-tint text-navy"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-ink">{calc.title}</span>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-ink-muted">
                    {calc.description}
                  </span>
                  <span className="mt-1.5 block text-[11px] text-ink-subtle">{calc.taxYear}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Form for the selected calculator */}
      <form
        onSubmit={submit}
        className="flex flex-col rounded-[12px] border border-line bg-surface p-5 sm:p-6"
      >
        <div>
          <p className="display-sm">{active.title}</p>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            Enter the key figures. The full calculator opens with your values applied.
          </p>
        </div>

        <div className="mt-5 flex-1 space-y-4">
          {activeKey === "income-tax" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pick-salary" className={LABEL}>
                    Annual salary income
                  </label>
                  <input
                    id="pick-salary"
                    type="text"
                    inputMode="numeric"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="0"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="pick-deductions" className={LABEL}>
                    Section 80C deductions
                  </label>
                  <input
                    id="pick-deductions"
                    type="text"
                    inputMode="numeric"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    placeholder="0"
                    className={FIELD}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pick-age" className={LABEL}>
                  Age category
                </label>
                <select
                  id="pick-age"
                  value={ageCategory}
                  onChange={(e) => setAgeCategory(e.target.value)}
                  className={FIELD}
                >
                  <option value="general">Below 60 years</option>
                  <option value="senior">60 years or above, below 80</option>
                  <option value="superSenior">80 years or above</option>
                </select>
              </div>
              <p className="text-[12px] leading-relaxed text-ink-subtle">
                Both regimes are shown side by side. The calculator does not identify a preferred
                regime.
              </p>
            </>
          ) : null}

          {activeKey === "tds" ? (
            <>
              <div>
                <label htmlFor="pick-section" className={LABEL}>
                  Payment category
                </label>
                <select
                  id="pick-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className={FIELD}
                >
                  {TDS_SECTIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} — {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pick-payment" className={LABEL}>
                  Payment amount
                </label>
                <input
                  id="pick-payment"
                  type="text"
                  inputMode="numeric"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  placeholder="0"
                  className={FIELD}
                />
              </div>
              <label htmlFor="pick-pan" className="flex items-start gap-2.5 py-1">
                <input
                  id="pick-pan"
                  type="checkbox"
                  checked={panAvailable}
                  onChange={(e) => setPanAvailable(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f2c52]"
                />
                <span className="text-[13px] leading-relaxed text-ink-muted">
                  PAN of the payee is available
                </span>
              </label>
            </>
          ) : null}

          {activeKey === "gst" ? (
            <>
              <div>
                <label htmlFor="pick-amount" className={LABEL}>
                  Amount
                </label>
                <input
                  id="pick-amount"
                  type="text"
                  inputMode="decimal"
                  value={gstAmount}
                  onChange={(e) => setGstAmount(e.target.value)}
                  placeholder="0"
                  className={FIELD}
                />
              </div>
              <div>
                <span className={LABEL}>The amount entered is</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "exclusive", label: "Exclusive of GST" },
                    { value: "inclusive", label: "Inclusive of GST" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAmountType(option.value)}
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
              </div>
              <div>
                <span className={LABEL}>GST rate</span>
                <div className="flex flex-wrap gap-2">
                  {GST_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setGstRate(rate)}
                      aria-pressed={gstRate === rate}
                      className={`min-h-[40px] min-w-[56px] rounded-[8px] border px-3 text-[13px] transition-colors ${
                        gstRate === rate
                          ? "border-navy bg-navy text-white"
                          : "border-line-strong bg-surface text-ink-muted hover:border-navy"
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[8px] bg-accent px-5 text-[14px] font-medium text-white hover:bg-accent-hover sm:w-auto sm:self-start"
        >
          Calculate
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-ink-subtle">
          Values are processed in your browser and are not sent to the firm.
        </p>
      </form>
    </div>
  );
}
