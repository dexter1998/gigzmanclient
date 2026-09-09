import Link from "next/link";

/**
 * Rendered when a page calls `notFound()`. Unmatched URLs go to
 * `global-not-found.tsx` instead — the two conventions cover different cases
 * and both are needed; dropping this one left every `notFound()` call ending
 * as a bare `NEXT_HTTP_ERROR_FALLBACK;404` error page.
 *
 * Kept deliberately free of client components: marking this `"use client"`,
 * or importing a client child into it, stops Next resolving the fallback at
 * all. That also means no `usePathname`, so links are root-relative — correct
 * on a client's own domain (`TENANT_MODE=host`), which is how the live sites
 * are served.
 *
 * This one file covers every case: unmatched URLs, and `notFound()` raised by
 * a page (an unknown property or locality slug, a route gated off for a
 * tenant). Nested `not-found.tsx` files are not needed and are not picked up
 * from inside the `(public)` route group anyway.
 *
 * One quirk worth knowing when checking this by hand: Next ships the
 * not-found UI inside every page's RSC payload, so grepping a *good* page's
 * HTML for text from this file matches. Verify what is on screen (headline,
 * status) rather than what is in the payload.
 *
 * `/properties/<unknown-slug>` answers 200 rather than 404 while rendering
 * this page — that route streams, and Next documents 200 for a streamed
 * response and 404 for a non-streamed one. It is a soft 404 for crawlers;
 * worth revisiting if those URLs ever get indexed.
 */
const ELSEWHERE = [
  { href: "/localities", label: "Browse by locality" },
  { href: "/maps/gurgaon", label: "Gurugram plot maps" },
  { href: "/contact", label: "Talk to an advisor" },
];

export default function NotFound() {
  return (
    <div
      data-vertical="realestate"
      data-template="premium-v2"
      className="flex min-h-screen flex-col bg-[image:var(--gp-gradient-dark-section)]"
    >
      <div className="gp-container flex flex-1 flex-col justify-center py-20 sm:py-28">
        <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
        <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Error 404</p>

        <h1 className="gp-hero-title font-display mt-4 max-w-2xl text-white">
          This page isn&rsquo;t here.
        </h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
          The link may be old, or the listing it pointed at is no longer on the market. The
          inventory below is live.
        </p>

        <Link
          href="/properties"
          className="mt-9 inline-flex min-h-[52px] w-fit items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-7 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
        >
          Explore hot properties
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/12 pt-8">
          {ELSEWHERE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center gap-2.5 text-[14px] text-white/75 transition-colors hover:text-[color:var(--gp-gold-300)]"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
