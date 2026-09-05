"use client";

import { useMemo, useState } from "react";
import { Building2, Clock, Plus, Trash2, TrendingUp } from "lucide-react";
import {
  calculateBuildingRental,
  paybackVerdict,
  UNIT_TYPES,
  type RentableFloor,
  type UnitType,
} from "@/lib/calculators/rental-model";
import { formatInr, formatIndianPrice } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { GpContainer } from "../gp-primitives";
import { openLeadPopup } from "../leadPopup";

const FIELD =
  "min-h-[48px] w-full rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3.5 text-[15px] font-semibold text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none";
const LABEL = "mb-1.5 block text-[12px] text-[color:var(--gp-muted)]";

const num = (raw: string) => {
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function RentalYieldCalculatorV2({
  heading,
  subheading,
  initialValue,
  initialAppreciation,
  breadcrumb,
}: {
  heading: string;
  subheading: string;
  initialValue: number;
  initialAppreciation?: number;
  breadcrumb?: React.ReactNode;
}) {
  const [propertyValue, setPropertyValue] = useState(initialValue);
  const [totalFloors, setTotalFloors] = useState(4);
  const [vacancy, setVacancy] = useState(1);
  const [appreciation, setAppreciation] = useState(initialAppreciation ?? 8);
  const [floors, setFloors] = useState<RentableFloor[]>([
    { unitType: "3bhk", monthlyRent: 45000 },
    { unitType: "2bhk", monthlyRent: 32000 },
  ]);
  const [touched, setTouched] = useState(false);

  const result = useMemo(
    () =>
      calculateBuildingRental({
        propertyValue,
        totalFloors,
        rentableFloors: floors,
        vacancyMonthsPerYear: vacancy,
        annualAppreciationPercent: appreciation,
      }),
    [propertyValue, totalFloors, floors, vacancy, appreciation],
  );

  const touch = () => {
    if (touched) return;
    setTouched(true);
    analytics.calculatorStart("rental-yield", "hero");
  };

  const setFloor = (i: number, patch: Partial<RentableFloor>) =>
    setFloors((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const addFloor = () =>
    setFloors((prev) =>
      prev.length >= totalFloors ? prev : [...prev, { unitType: "2bhk" as UnitType, monthlyRent: 30000 }],
    );

  return (
    <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ background: "var(--gp-gradient-glow)" }}
      />
      <GpContainer className="relative py-12 sm:py-16">
        {breadcrumb ? <div className="mb-6">{breadcrumb}</div> : null}

        <div className="max-w-3xl">
          <h1 className="gp-hero-title font-display text-white">{heading}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            {subheading}
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-gold-600)]/35 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ── Inputs ───────────────────────────────────────────── */}
          <div className="bg-[color:var(--gp-cream-100)] p-6 sm:p-8">
            <h2 className="font-display text-[22px] text-[color:var(--gp-ink)] sm:text-[26px]">
              Your property
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="ry-value">
                  Approximate property worth
                </label>
                <input
                  id="ry-value"
                  inputMode="numeric"
                  value={formatInr(propertyValue)}
                  onFocus={touch}
                  onChange={(e) => setPropertyValue(num(e.target.value))}
                  className={FIELD}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="ry-floors">
                  Total floors
                </label>
                <input
                  id="ry-floors"
                  inputMode="numeric"
                  value={totalFloors}
                  onFocus={touch}
                  onChange={(e) => setTotalFloors(Math.max(1, Math.min(20, num(e.target.value))))}
                  className={FIELD}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-[color:var(--gp-ink)]">
                Floors you will rent out
              </h3>
              <button
                type="button"
                onClick={addFloor}
                disabled={floors.length >= totalFloors}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3 text-[12.5px] font-semibold text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)] disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add floor
              </button>
            </div>
            <p className="mt-1 text-[12px] text-[color:var(--gp-muted)]">
              Leave out any floor you live in yourself — only let floors earn.
            </p>

            <div className="mt-4 space-y-3">
              {floors.map((floor, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-3 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center"
                >
                  <span className="text-[12.5px] font-semibold text-[color:var(--gp-muted)]">
                    Floor {i + 1}
                  </span>
                  <select
                    aria-label={`Floor ${i + 1} configuration`}
                    value={floor.unitType}
                    onFocus={touch}
                    onChange={(e) => setFloor(i, { unitType: e.target.value as UnitType })}
                    className="min-h-[44px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3 text-[14px] text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none"
                  >
                    {UNIT_TYPES.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={`Floor ${i + 1} monthly rent`}
                    inputMode="numeric"
                    value={formatInr(floor.monthlyRent)}
                    onFocus={touch}
                    onChange={(e) => setFloor(i, { monthlyRent: num(e.target.value) })}
                    className="min-h-[44px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3 text-[14px] font-semibold text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFloors((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label={`Remove floor ${i + 1}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gp-muted)] transition-colors hover:bg-[color:var(--gp-cream-200)] hover:text-[color:var(--gp-ink)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="ry-vac">
                  Vacancy (months per year)
                </label>
                <input
                  id="ry-vac"
                  inputMode="numeric"
                  value={vacancy}
                  onChange={(e) => setVacancy(Math.max(0, Math.min(12, num(e.target.value))))}
                  className={FIELD}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="ry-app">
                  Annual appreciation (%)
                </label>
                <input
                  id="ry-app"
                  inputMode="decimal"
                  value={appreciation}
                  onChange={(e) => setAppreciation(Math.max(0, Math.min(30, num(e.target.value))))}
                  className={FIELD}
                />
              </div>
            </div>
          </div>

          {/* ── Result ───────────────────────────────────────────── */}
          <div className="bg-[image:var(--gp-gradient-dark-section)] p-6 sm:p-8">
            <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Time to pay for itself</p>

            <p className="font-display mt-3 text-[40px] leading-none text-white sm:text-[52px]">
              <span className="font-sans font-semibold">
                {result.paybackYearsWithAppreciation
                  ? Math.round(result.paybackYearsWithAppreciation)
                  : "—"}
              </span>{" "}
              <span className="text-[20px] sm:text-[24px]">years</span>
            </p>
            <p className="mt-2 text-[13px] text-white/60">
              counting rent and appreciation together
            </p>

            <dl className="mt-7 space-y-3">
              {[
                {
                  label: "On rent alone",
                  value: result.paybackYearsRentOnly
                    ? `${Math.round(result.paybackYearsRentOnly)} years`
                    : "—",
                  icon: Clock,
                },
                { label: "Gross yield", value: `${result.grossYieldPercent.toFixed(2)}%`, icon: TrendingUp },
                { label: "Net yield", value: `${result.netYieldPercent.toFixed(2)}%`, icon: TrendingUp },
                {
                  label: "Value doubles in",
                  value: result.doublingYears ? `${result.doublingYears.toFixed(1)} years` : "—",
                  icon: Building2,
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="flex items-center gap-2.5 text-[13.5px] text-white/75">
                      <Icon className="h-4 w-4 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                      {row.label}
                    </dt>
                    <dd className="font-sans text-[15px] font-semibold text-white">{row.value}</dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-6 rounded-[var(--gp-radius-md)] border border-white/12 bg-white/[0.04] p-4">
              <p className="text-[11.5px] uppercase tracking-[0.08em] text-white/50">Annual rent</p>
              <p className="font-sans mt-1 text-[22px] font-semibold text-[color:var(--gp-gold-300)]">
                {formatIndianPrice(result.netAnnualRent)}
              </p>
              <p className="mt-1 text-[12px] text-white/55">
                net of {formatIndianPrice(result.vacancyLoss)} vacancy and{" "}
                {formatIndianPrice(result.estimatedAnnualExpenses)} running costs
              </p>
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-white/70">{paybackVerdict(result)}</p>

            <button
              type="button"
              onClick={() => {
                analytics.calculatorComplete("rental-yield", null);
                openLeadPopup("calculator");
              }}
              className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-bold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              Get this reviewed by an advisor
            </button>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-[12px] leading-relaxed text-white/45">
          Running costs are estimated as a flat share of collected rent rather than your actual
          maintenance, tax and repair bills. Appreciation is an assumption you set, not a forecast.
          Treat the result as a planning estimate.
        </p>
      </GpContainer>
    </section>
  );
}
