"use client";

import { useActionState } from "react";
import Image from "next/image";
import { CheckCircle2, FileText, Lock, UserRound, Headphones } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";
import { formatInr } from "@/lib/format";
import { lenderLogoSrc, type Lender } from "@/lib/home-loan/banks";
import { GpContainer } from "../gp-primitives";

const HERO_IMAGE = "/verticals/realestate/templates/premium-v2/images/hero-curated-inventory-v2.png";

const FIELD =
  "min-h-[48px] w-full rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-3.5 text-[14px] text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none";
const LABEL = "mb-1.5 block text-[12.5px] text-[color:var(--gp-body)]";

const CITIES = ["Gurugram", "Delhi", "Noida", "Faridabad", "Ghaziabad", "Other"];

const INITIAL: QueryFormState = { ok: false };

export default function BankLoanHeroV2({
  lender,
  defaultAmount,
  headline,
  intro,
  breadcrumb,
}: {
  lender: Lender;
  defaultAmount: number;
  headline: string;
  intro: string;
  breadcrumb?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<QueryFormState, FormData>(submitQuery, INITIAL);

  return (
    <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
      <Image src={HERO_IMAGE} alt="" fill sizes="100vw" priority className="object-cover object-[75%_center]" />
      <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />

      <GpContainer className="relative py-12 sm:py-16">
        {breadcrumb ? <div className="mb-7">{breadcrumb}</div> : null}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* ── Left: positioning ─────────────────────────────────── */}
          <div>
            <span
              className={`inline-flex items-center rounded-[var(--gp-radius-sm)] p-3 ${
                lender.logoNeedsDarkBg ? "bg-[color:var(--gp-forest-900)]" : "bg-white"
              }`}
            >
              <Image
                src={lenderLogoSrc(lender)}
                alt={lender.name}
                width={190}
                height={54}
                className="h-9 w-auto object-contain sm:h-11"
              />
            </span>

            <p className="gp-eyebrow mt-6 text-[color:var(--gp-gold-300)]">Home loan approval support</p>
            <h1 className="gp-hero-title font-display mt-3 text-white">{headline}</h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">{intro}</p>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              {[
                { icon: UserRound, label: "Eligibility assistance" },
                { icon: FileText, label: "Document guidance" },
                { icon: Headphones, label: "Dedicated loan advisor" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className={`flex items-center gap-2.5 ${i > 0 ? "sm:border-l sm:border-white/20 sm:pl-7" : ""}`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
                    <span className="text-[13.5px] text-white/85">{f.label}</span>
                  </div>
                );
              })}
            </div>

            <p className="mt-7 text-[13.5px] text-white/60">For salaried and self-employed applicants.</p>
          </div>

          {/* ── Right: eligibility capture ────────────────────────── */}
          <div
            className="rounded-[var(--gp-radius-lg)] p-6 sm:p-8"
            style={{ background: "var(--gp-gradient-glass)", boxShadow: "var(--shadow-raised)" }}
          >
            <span
              className={`inline-flex items-center rounded-[var(--gp-radius-sm)] p-2 ${
                lender.logoNeedsDarkBg ? "bg-[color:var(--gp-forest-900)]" : ""
              }`}
            >
              <Image
                src={lenderLogoSrc(lender)}
                alt=""
                width={160}
                height={44}
                className="h-8 w-auto object-contain"
              />
            </span>

            {state.ok ? (
              <div className="flex flex-col items-start gap-3 py-8">
                <CheckCircle2 className="h-10 w-10 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                <h2 className="font-display text-[18px] text-[color:var(--gp-ink)]">Request received.</h2>
                <p className="text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                  An advisor will call you with an indicative eligibility for {lender.name}. Reference{" "}
                  {state.reference}.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display mt-4 text-[19px] leading-tight text-[color:var(--gp-ink)] sm:text-[22px]">
                  Check your loan eligibility
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
                  Share a few details to receive an indicative eligibility call.
                </p>

                <form action={formAction} className="mt-6 space-y-4">
                  <input type="hidden" name="consent" value="on" />
                  <input type="hidden" name="preferredContact" value="phone" />
                  <input type="hidden" name="clientType" value="individual" />

                  <div>
                    <label className={LABEL} htmlFor="hl-amount">
                      Required loan amount
                    </label>
                    <input
                      id="hl-amount"
                      name="loanAmount"
                      inputMode="numeric"
                      defaultValue={formatInr(defaultAmount)}
                      className={FIELD}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL} htmlFor="hl-name">
                        Full name
                      </label>
                      <input
                        id="hl-name"
                        name="name"
                        required
                        placeholder="Enter your name"
                        className={FIELD}
                        aria-invalid={Boolean(state.errors?.name)}
                      />
                      {state.errors?.name ? (
                        <p role="alert" className="mt-1 text-[12px] text-status-danger">
                          {state.errors.name}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className={LABEL} htmlFor="hl-phone">
                        Mobile number
                      </label>
                      <input
                        id="hl-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        required
                        placeholder="+91"
                        className={FIELD}
                        aria-invalid={Boolean(state.errors?.phone)}
                      />
                      {state.errors?.phone ? (
                        <p role="alert" className="mt-1 text-[12px] text-status-danger">
                          {state.errors.phone}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} htmlFor="hl-city">
                      City
                    </label>
                    <select id="hl-city" name="city" defaultValue="Gurugram" className={FIELD}>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="hidden"
                    name="message"
                    value={`Home loan eligibility enquiry for ${lender.name}.`}
                  />

                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-1 inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-forest-900)] text-[13.5px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[color:var(--gp-forest-800)] disabled:opacity-60"
                  >
                    {pending ? "Sending…" : "Check eligibility"}
                  </button>

                  <p className="flex items-center justify-center gap-2 text-[12px] text-[color:var(--gp-muted)]">
                    <Lock className="h-3.5 w-3.5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    Your details stay private and are shared only for your enquiry.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </GpContainer>
    </section>
  );
}
