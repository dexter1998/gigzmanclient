"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { AREA_UNITS, convertArea, formatArea, findUnit } from "@/lib/calculators/area-units";
import { analytics } from "@/lib/analytics";
import { GpContainer } from "../gp-primitives";
import { openLeadPopup } from "../leadPopup";

const FIELD =
  "min-h-[52px] w-full rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3.5 text-[16px] font-semibold text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none";
const LABEL = "mb-1.5 block text-[12px] text-[color:var(--gp-muted)]";

export default function AreaConverterV2({
  heading,
  subheading,
  initialFrom = "square-yard",
  initialTo = "square-feet",
  breadcrumb,
}: {
  heading: string;
  subheading: string;
  initialFrom?: string;
  initialTo?: string;
  breadcrumb?: React.ReactNode;
}) {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [touched, setTouched] = useState(false);

  const fromUnit = findUnit(from) ?? AREA_UNITS[0];
  const toUnit = findUnit(to) ?? AREA_UNITS[1];

  const result = useMemo(() => {
    const n = Number(value.replace(/[^0-9.]/g, ""));
    return convertArea(Number.isFinite(n) ? n : 0, fromUnit, toUnit);
  }, [value, fromUnit, toUnit]);

  const touch = () => {
    if (touched) return;
    setTouched(true);
    analytics.calculatorStart("area-converter", "hero");
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

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

        <div className="mt-9 grid grid-cols-1 overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-gold-600)]/35 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[color:var(--gp-cream-100)] p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <div>
                <label className={LABEL} htmlFor="ac-value">
                  Area
                </label>
                <input
                  id="ac-value"
                  inputMode="decimal"
                  value={value}
                  onFocus={touch}
                  onChange={(e) => setValue(e.target.value)}
                  className={FIELD}
                />
                <label className={`${LABEL} mt-3`} htmlFor="ac-from">
                  From
                </label>
                <select
                  id="ac-from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={`${FIELD} cursor-pointer`}
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u.slug} value={u.slug}>
                      {u.name}
                      {u.aka?.length ? ` (${u.aka[0]})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={swap}
                aria-label="Swap units"
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-gold-600)] transition-colors hover:border-[color:var(--gp-gold-600)] sm:mb-1"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <div>
                <label className={LABEL} htmlFor="ac-result">
                  Result
                </label>
                <output
                  id="ac-result"
                  className="flex min-h-[52px] w-full items-center rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-gold-600)]/40 bg-white px-3.5 text-[16px] font-semibold text-[color:var(--gp-gold-600)]"
                >
                  {formatArea(result)}
                </output>
                <label className={`${LABEL} mt-3`} htmlFor="ac-to">
                  To
                </label>
                <select
                  id="ac-to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={`${FIELD} cursor-pointer`}
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u.slug} value={u.slug}>
                      {u.name}
                      {u.aka?.length ? ` (${u.aka[0]})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-6 rounded-[var(--gp-radius-sm)] bg-white px-4 py-3 text-[14px] text-[color:var(--gp-body)]">
              <strong className="text-[color:var(--gp-ink)]">
                1 {fromUnit.name} = {formatArea(convertArea(1, fromUnit, toUnit))} {toUnit.name}
              </strong>
            </p>

            {(fromUnit.stateSpecific || toUnit.stateSpecific) && (
              <p className="mt-3 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
                Marla, kanal, bigha, biswa, killa and murabba differ by state. The values used here
                are the Haryana ones, which is what applies to Gurugram land records.
              </p>
            )}
          </div>

          <div className="bg-[image:var(--gp-gradient-dark-section)] p-6 sm:p-8">
            <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Buying in Gurugram?</p>
            <h2 className="font-display mt-3 text-[24px] leading-tight text-white sm:text-[28px]">
              Know the plot size. Now see what it costs.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/70">
              Gurugram plots are quoted in gaj and marla, and the same size is priced very
              differently across corridors. An advisor can tell you what this size actually goes for
              in the sector you are looking at.
            </p>
            <button
              type="button"
              onClick={() => openLeadPopup("calculator")}
              className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-bold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              Get a price for this size
            </button>
          </div>
        </div>
      </GpContainer>
    </section>
  );
}
