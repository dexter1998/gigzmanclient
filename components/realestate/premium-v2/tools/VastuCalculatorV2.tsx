"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Compass } from "lucide-react";
import {
  DIRECTIONS,
  ROOMS,
  scoreVastu,
  VASTU_DISCLAIMER,
  type DirectionSlug,
} from "@/lib/vastu";
import { analytics } from "@/lib/analytics";
import { GpContainer } from "../gp-primitives";
import { openLeadPopup } from "../leadPopup";

const SELECT =
  "min-h-[46px] w-full rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3 text-[14px] text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none";

export default function VastuCalculatorV2({
  heading,
  subheading,
  breadcrumb,
}: {
  heading: string;
  subheading: string;
  breadcrumb?: React.ReactNode;
}) {
  const [answers, setAnswers] = useState<Record<string, DirectionSlug | "">>({});
  const [touched, setTouched] = useState(false);

  const result = useMemo(
    () =>
      scoreVastu(
        Object.entries(answers)
          .filter(([, dir]) => dir)
          .map(([room, direction]) => ({ room, direction: direction as DirectionSlug })),
      ),
    [answers],
  );

  const set = (room: string, direction: string) => {
    if (!touched) {
      setTouched(true);
      analytics.calculatorStart("vastu", "hero");
    }
    setAnswers((prev) => ({ ...prev, [room]: direction as DirectionSlug | "" }));
  };

  const bandColour =
    result.score >= 85
      ? "var(--gp-gold-300)"
      : result.score >= 65
        ? "var(--gp-gold-600)"
        : result.score >= 45
          ? "var(--gp-muted)"
          : "var(--gp-muted)";

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
            <h2 className="font-display text-[22px] text-[color:var(--gp-ink)] sm:text-[26px]">
              Where is each room?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-muted)]">
              Stand in the centre of the home facing the main door with a compass. Fill in what you
              know — the score adjusts to however many you answer.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ROOMS.map((room) => (
                <div key={room.slug}>
                  <label
                    className="mb-1.5 block text-[12px] text-[color:var(--gp-muted)]"
                    htmlFor={`v-${room.slug}`}
                  >
                    {room.name}
                  </label>
                  <select
                    id={`v-${room.slug}`}
                    value={answers[room.slug] ?? ""}
                    onChange={(e) => set(room.slug, e.target.value)}
                    className={`${SELECT} cursor-pointer`}
                  >
                    <option value="">Not sure</option>
                    {DIRECTIONS.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[image:var(--gp-gradient-dark-section)] p-6 sm:p-8">
            <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Directional score</p>

            <div className="mt-4 flex items-baseline gap-3">
              <span
                className="font-sans text-[52px] font-semibold leading-none"
                style={{ color: bandColour }}
              >
                {result.answered > 0 ? result.score : "—"}
              </span>
              <span className="text-[18px] text-white/60">/ 100</span>
            </div>
            <p className="mt-2 text-[14px] font-semibold text-white">
              {result.answered > 0 ? result.band : "Answer a few rooms to see a score"}
            </p>
            <p className="mt-1 text-[12px] text-white/50">
              {result.answered} of {ROOMS.length} rooms answered
            </p>

            {result.concerns.length > 0 ? (
              <div className="mt-6">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
                  <AlertCircle className="h-4 w-4 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                  Worth looking at
                </p>
                <ul className="mt-3 space-y-3">
                  {result.concerns.slice(0, 4).map((c) => (
                    <li key={c.room.slug} className="text-[12.5px] leading-relaxed text-white/70">
                      <span className="font-medium text-white">
                        {c.room.name} in the {c.direction.name.toLowerCase()}
                      </span>
                      {" — "}
                      {c.suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.favourable.length > 0 ? (
              <div className="mt-6">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                  Traditionally well placed
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
                  {result.favourable.map((f) => f.room.name).join(", ")}.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                analytics.calculatorComplete("vastu", null);
                openLeadPopup("calculator");
              }}
              className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] text-[13.5px] font-bold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              Find vastu-suited homes
            </button>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-[12px] leading-relaxed text-white/45">{VASTU_DISCLAIMER}</p>
      </GpContainer>
    </section>
  );
}
