"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, CalendarClock, ArrowRight } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

interface CompliancePopupProps {
  deadlineId: string;
  title: string;
  effectiveDate: string;
  targetIso: string;
  daysRemaining: number;
  href: string;
  /** Only surfaces when the deadline is this close. */
  thresholdDays?: number;
}

const MOBILE_BREAKPOINT = 768;
const DELAY_MS = 6000;
const SCROLL_TRIGGER = 0.4;

/** Routes where the notice is redundant or would interrupt a conversion. */
const SUPPRESSED_PATHS = ["/compliance-calendar", "/contact", "/thank-you"];

const storageKey = (id: string) => `compliance-dismissed:${id}`;
const sessionKey = (id: string) => `compliance-shown:${id}`;

/**
 * Mobile-only companion to the announcement bar.
 *
 * Rules enforced here, documented in docs/popup-rules.md:
 *  1. mobile viewports only — desktop already shows the bar
 *  2. only within the configured threshold
 *  3. never on first paint (delay or scroll depth)
 *  4. once per session, dismissal remembered per deadline
 *  5. suppressed on the calendar and contact routes
 *  6. non-blocking bottom sheet with a persistent close control
 *  7. no motion when the visitor prefers reduced motion
 *  8. renders nothing when no deadline qualifies
 */
export default function CompliancePopup({
  deadlineId,
  title,
  effectiveDate,
  targetIso,
  daysRemaining,
  href,
  thresholdDays = 15,
}: CompliancePopupProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  const withinThreshold = daysRemaining >= 0 && daysRemaining <= thresholdDays;
  const suppressedRoute = SUPPRESSED_PATHS.some((p) => pathname?.endsWith(p));

  useEffect(() => {
    if (!withinThreshold || suppressedRoute) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;

    // Storage can throw in private modes; a failure here must not break the page.
    try {
      if (localStorage.getItem(storageKey(deadlineId))) return;
      if (sessionStorage.getItem(sessionKey(deadlineId))) return;
    } catch {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveal = () => {
      setVisible(true);
      if (!reduceMotion) requestAnimationFrame(() => setAnimate(true));
      else setAnimate(true);
      try {
        sessionStorage.setItem(sessionKey(deadlineId), "1");
      } catch {
        /* storage unavailable — the popup simply may reappear next session */
      }
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_TRIGGER) reveal();
    };

    const timer = setTimeout(reveal, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [deadlineId, withinThreshold, suppressedRoute]);

  if (!visible) return null;

  const dismiss = () => {
    setAnimate(false);
    setVisible(false);
    try {
      localStorage.setItem(storageKey(deadlineId), "1");
    } catch {
      /* nothing to persist to — dismissal lasts for this session only */
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Upcoming compliance deadline"
      className={`fixed inset-x-0 bottom-0 z-50 md:hidden ${
        animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } transition-[transform,opacity] duration-300`}
      style={{ maxHeight: "40vh" }}
    >
      <div className="m-3 overflow-hidden rounded-[12px] border border-line bg-surface shadow-[0_2px_4px_rgba(15,39,68,0.06),0_16px_40px_-16px_rgba(15,39,68,0.28)]">
        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft">
            <CalendarClock className="h-4 w-4 text-accent" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="eyebrow">Compliance alert</p>
            <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">{title}</p>
            <p className="mt-1 text-[12px] text-ink-muted">Due {effectiveDate}</p>
            <div className="mt-2 inline-flex rounded-full bg-tint-deep px-2.5 py-1 text-ink">
              <CountdownTimer targetIso={targetIso} compact />
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-subtle hover:bg-tint-deep hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <Link
          href={href}
          onClick={dismiss}
          className="flex items-center justify-between border-t border-line bg-tint px-4 py-3 text-[13px] font-medium text-navy"
        >
          View compliance calendar
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
