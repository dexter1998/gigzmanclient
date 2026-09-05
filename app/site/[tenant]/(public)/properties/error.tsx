"use client";

/**
 * `data-vertical`/`data-template` are stamped on `<html>` at request start
 * (see app/layout.tsx), before this boundary can ever mount — so the plain
 * `bg-tint`/`text-ink` tokens below already resolve to each template's own
 * palette (forest/gold for premium-v2, navy/gold for the others) with no
 * per-template branching needed here.
 */
export default function PropertiesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-5 py-24 text-center">
      <p className="font-display text-[26px] text-ink">Properties didn&rsquo;t load.</p>
      <p className="text-[14px] text-ink-muted">
        Something went wrong fetching this listing. Try again, or head back to the homepage.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex min-h-[46px] items-center rounded-[8px] bg-navy px-6 text-[14px] font-medium text-white hover:bg-navy-soft"
      >
        Try again
      </button>
    </div>
  );
}
