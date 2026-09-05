"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { submitQuery, type QueryFormState } from "@/lib/actions/submit-query";

const INITIAL_STATE: QueryFormState = { ok: false };

/**
 * There is no newsletter/ESP integration in this codebase — this form
 * submits into the same lead table every other form on the site uses
 * (`submitQuery`), tagged with a hidden "Newsletter signup" name so it's a
 * real, working capture rather than a decorative dead form. Mirrors the
 * minimal hidden-fields + useActionState pattern in HeroV2.
 */
export default function UpdatesNewsletterFormV2({ basePath }: { basePath: string }) {
  const [state, formAction, pending] = useActionState<QueryFormState, FormData>(
    submitQuery,
    INITIAL_STATE,
  );

  if (state.ok) {
    return (
      <p className="mt-8 max-w-md text-[14.5px] font-medium leading-relaxed text-[color:var(--gp-gold-300)]">
        You&rsquo;re on the list — Gurugram updates land in your inbox as we publish them.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 max-w-md">
      <input type="hidden" name="name" value="Newsletter signup" />
      <input type="hidden" name="consent" value="on" />
      <input type="hidden" name="preferredContact" value="email" />
      <input type="hidden" name="landingPage" value={basePath} />
      <input type="hidden" name="message" value="Requested Gurugram market updates by email." />

      <div className="flex items-stretch overflow-hidden rounded-[var(--gp-radius-sm)] border border-white/25 bg-white/95 focus-within:border-[color:var(--gp-gold-600)]">
        <label htmlFor="gp-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="gp-newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className="min-h-[54px] min-w-0 flex-1 bg-transparent px-3.5 text-[14px] text-[color:var(--gp-ink)] focus:outline-none"
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "gp-newsletter-email-error" : undefined}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[54px] shrink-0 items-center justify-center gap-1.5 bg-[color:var(--gp-gold-600)] px-5 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] disabled:opacity-60"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {pending ? "Sending…" : "Subscribe"}
        </button>
      </div>
      {state.errors?.email ? (
        <p id="gp-newsletter-email-error" role="alert" className="mt-1.5 text-[12px] text-white/80">
          {state.errors.email}
        </p>
      ) : null}
      {!state.ok && state.message && !state.errors ? (
        <p role="alert" className="mt-1.5 text-[12px] text-white/80">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
