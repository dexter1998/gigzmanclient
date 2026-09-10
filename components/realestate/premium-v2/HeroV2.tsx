"use client";

import { useActionState } from "react";
import Image from "next/image";
import { ArrowRight, Award, IndianRupee, PhoneCall, Ruler, ShieldCheck, Signpost, Trees, Users } from "lucide-react";
import { joinPath } from "@/lib/paths";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { openLeadPopup } from "./leadPopup";
import type { HeroCopy, HeroStat } from "@/lib/premium-v2/positioning";

interface HeroV2Props {
  basePath: string;
  heroImageSrc: string;
  firmName: string;
  /** Headline, supporting line and trust row — see lib/premium-v2/positioning.ts. */
  copy: HeroCopy;
  /** Values for the trust row, counted from this client's own inventory. */
  stats: { label: string; value: string; icon: HeroStat["icon"] }[];
}

const STAT_ICONS = {
  Award,
  Users,
  Signpost,
  ShieldCheck,
  Trees,
  Ruler,
  IndianRupee,
} as const;

const INITIAL_STATE: QueryFormState = { ok: false };

export default function HeroV2({ basePath, heroImageSrc, firmName, copy, stats }: HeroV2Props) {
  const p = (path: string) => joinPath(basePath, path);
  const [state, formAction, pending] = useActionState<QueryFormState, FormData>(
    submitQuery,
    INITIAL_STATE,
  );

  return (
    // `<main>` carries a top padding sized for the fixed header (88px
    // mobile / 104px lg — HeaderV2's measured rendered height) so every
    // other (non-hero) page's content clears it — but that padding sits
    // outside this section's own dark background, leaving a blank gap
    // above the hero specifically. Pulling the hero up by that exact same
    // amount restores true edge-to-edge bleed under the transparent header,
    // and the inner padding below adds back HeroV2's own breathing room
    // beneath the header.
    <section className="relative -mt-[88px] overflow-hidden bg-navy lg:-mt-[104px]">
      <Image
        src={heroImageSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />
      <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />

      <div className="gp-container relative pb-16 pt-[calc(88px+3.5rem)] lg:pb-24 lg:pt-[calc(140px+5rem)]">
        <div className="max-w-2xl">
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{copy.eyebrow}</p>
          <h1 className="gp-hero-title font-display mt-4 text-white">
            {copy.headline[0]}
            <br />
            {copy.headline[1]}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-base">
            {copy.blurb}
          </p>

          {state.ok ? (
            <p className="mt-8 max-w-md text-[14.5px] font-medium leading-relaxed text-[color:var(--gp-gold-300)]">
              Request received — an advisor will call you shortly. Reference {state.reference}.
            </p>
          ) : (
            <form action={formAction} className="mt-8 max-w-md">
              <input type="hidden" name="name" value="Instant call request" />
              <input type="hidden" name="consent" value="on" />
              <input type="hidden" name="preferredContact" value="phone" />
              <input type="hidden" name="landingPage" value={basePath} />
              <input
                type="hidden"
                name="message"
                value="Requested an instant call back from the homepage hero."
              />

              <div className="flex items-stretch overflow-hidden rounded-[var(--gp-radius-sm)] border border-white/25 bg-white/95 focus-within:border-[color:var(--gp-gold-600)]">
                <label htmlFor="gp-hero-phone" className="sr-only">
                  Phone number
                </label>
                <input
                  id="gp-hero-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="Your mobile number"
                  className="min-h-[54px] min-w-0 flex-1 bg-transparent px-3.5 text-[14px] text-[color:var(--gp-ink)] focus:outline-none"
                  aria-invalid={Boolean(state.errors?.phone)}
                  aria-describedby={state.errors?.phone ? "gp-hero-phone-error" : undefined}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex min-h-[54px] shrink-0 items-center justify-center gap-1.5 bg-[color:var(--gp-gold-600)] px-4 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60 sm:px-5"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  {pending ? "Sending…" : "Get Call Now"}
                </button>
              </div>
              {state.errors?.phone ? (
                <p id="gp-hero-phone-error" role="alert" className="mt-1.5 text-[12px] text-status-danger">
                  {state.errors.phone}
                </p>
              ) : null}
            </form>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={p("/properties")}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              Explore Properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => openLeadPopup()}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/35 px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-white"
            >
              Book a Consultation
            </button>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = STAT_ICONS[stat.icon];
              return (
                <div key={stat.label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                  <div>
                    <dt className="font-sans text-[28px] font-semibold leading-none text-[color:var(--gp-gold-300)]">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-[11.5px] leading-snug text-white/65">{stat.label}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
