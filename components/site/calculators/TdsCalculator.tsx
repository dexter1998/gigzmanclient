"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { calculateTds, TDS_SECTIONS } from "@/lib/calculators/tds";
import { formatInr } from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface TdsCalculatorProps {
  calculatorKey: string;
  version: string;
  taxYear: string;
}

const FIELD =
  "w-full min-h-[44px] rounded-[8px] border border-line-strong bg-surface px-3 text-[14px] text-ink focus:border-navy focus:outline-none";

export default function TdsCalculator({ calculatorKey, version, taxYear }: TdsCalculatorProps) {
  const [sectionCode, setSectionCode] = useState(TDS_SECTIONS[0].code);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [previousPayments, setPreviousPayments] = useState("");
  const [panAvailable, setPanAvailable] = useState(true);
  const [payeeIsIndividualOrHuf, setPayeeIsIndividualOrHuf] = useState(false);
  const [started, setStarted] = useState(false);
  const [computed, setComputed] = useState(false);

  const touch = () => {
    if (started) return;
    setStarted(true);
    analytics.calculatorStart(calculatorKey, version);
  };

  const toNumber = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;

  const result = useMemo(
    () =>
      calculateTds({
        sectionCode,
        paymentAmount: toNumber(paymentAmount),
        previousPayments: toNumber(previousPayments),
        panAvailable,
        payeeIsIndividualOrHuf,
      }),
    [sectionCode, paymentAmount, previousPayments, panAvailable, payeeIsIndividualOrHuf],
  );

  const hasPayment = toNumber(paymentAmount) > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="section" className="mb-1.5 block text-[13px] text-ink-muted">
            Payment category
          </label>
          <select
            id="section"
            value={sectionCode}
            onChange={(e) => {
              touch();
              setSectionCode(e.target.value);
            }}
            className={FIELD}
          >
            {TDS_SECTIONS.map((section) => (
              <option key={section.code} value={section.code}>
                {section.code} — {section.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="paymentAmount" className="mb-1.5 block text-[13px] text-ink-muted">
              Payment amount
            </label>
            <input
              id="paymentAmount"
              type="text"
              inputMode="numeric"
              value={paymentAmount}
              onChange={(e) => {
                touch();
                setPaymentAmount(e.target.value);
              }}
              placeholder="0"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="previousPayments" className="mb-1.5 block text-[13px] text-ink-muted">
              Paid earlier this year
            </label>
            <input
              id="previousPayments"
              type="text"
              inputMode="numeric"
              value={previousPayments}
              onChange={(e) => {
                touch();
                setPreviousPayments(e.target.value);
              }}
              placeholder="0"
              className={FIELD}
            />
            <p className="mt-1.5 text-[11px] text-ink-subtle">
              Thresholds apply to aggregate payments to the same payee.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-[10px] border border-line p-4">
          <label htmlFor="panAvailable" className="flex items-start gap-2.5">
            <input
              id="panAvailable"
              type="checkbox"
              checked={panAvailable}
              onChange={(e) => {
                touch();
                setPanAvailable(e.target.checked);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f2744]"
            />
            <span className="text-[13px] leading-relaxed text-ink-muted">
              PAN of the payee is available
            </span>
          </label>

          <label htmlFor="payeeType" className="flex items-start gap-2.5">
            <input
              id="payeeType"
              type="checkbox"
              checked={payeeIsIndividualOrHuf}
              onChange={(e) => {
                touch();
                setPayeeIsIndividualOrHuf(e.target.checked);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f2744]"
            />
            <span className="text-[13px] leading-relaxed text-ink-muted">
              Payee is an individual or Hindu undivided family
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            setComputed(true);
            if (hasPayment) analytics.calculatorComplete(calculatorKey, taxYear);
          }}
          className="min-h-[46px] w-full rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
        >
          Calculate Estimate
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[12px] bg-navy text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[13px] font-semibold">Deduction summary</p>
            <p className="mt-0.5 text-[11px] text-white/50">{taxYear}</p>
          </div>

          {!computed || !hasPayment ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/55">
              Enter a payment amount and select Calculate Estimate.
            </p>
          ) : (
            <div className="space-y-3 px-5 py-4">
              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Applicable section</p>
                <p className="mt-0.5 text-[15px] font-semibold">{result.section?.code}</p>
                <p className="mt-0.5 text-[11px] text-white/60">{result.section?.label}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                  <p className="text-[11px] text-white/50">Threshold</p>
                  <p className="mt-0.5 text-[13px] font-medium tabular-nums">
                    {formatInr(result.threshold)}
                  </p>
                </div>
                <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                  <p className="text-[11px] text-white/50">Applied rate</p>
                  <p className="mt-0.5 text-[13px] font-medium tabular-nums">
                    {(result.appliedRate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="rounded-[8px] bg-accent/20 px-3.5 py-3">
                <p className="text-[11px] text-white/60">Estimated TDS</p>
                <p className="mt-0.5 text-[20px] font-semibold tabular-nums">
                  {formatInr(result.tdsAmount)}
                </p>
              </div>

              <div className="rounded-[8px] bg-white/[0.06] px-3.5 py-3">
                <p className="text-[11px] text-white/50">Net amount payable</p>
                <p className="mt-0.5 text-[15px] font-semibold tabular-nums">
                  {formatInr(result.netPayable)}
                </p>
              </div>

              <p className="text-[11px] leading-relaxed text-white/55">{result.rateBasis}.</p>

              {result.notes.length > 0 ? (
                <ul className="space-y-2 border-t border-white/10 pt-3">
                  {result.notes.map((note) => (
                    <li key={note} className="flex gap-2 text-[11px] leading-relaxed text-white/55">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
