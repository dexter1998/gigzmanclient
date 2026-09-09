"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/lib/analytics";

/**
 * Fires 25/50/75/90% scroll milestones once per page view.
 *
 * GA4's Enhanced Measurement already sends a `scroll` event, but only at 90%,
 * which cannot separate a page people abandon at the fold from one they read
 * to the end — the difference that decides whether a pSEO page is earning its
 * place. These milestones can.
 *
 * Deliberately passive: one scroll listener, `passive: true`, and each
 * milestone is sent at most once per path so a user scrolling up and down does
 * not inflate the count.
 */
const MILESTONES = [25, 50, 75, 90] as const;

export default function ScrollDepthTracker({ pageType }: { pageType: string }) {
  const pathname = usePathname();
  const sent = useRef<Set<number>>(new Set());

  useEffect(() => {
    sent.current = new Set();

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // A page shorter than the viewport can never be "scrolled through";
      // reporting 90% for it would overstate engagement everywhere.
      if (scrollable < 200) return;

      const percent = ((window.scrollY || doc.scrollTop) / scrollable) * 100;
      for (const m of MILESTONES) {
        if (percent >= m && !sent.current.has(m)) {
          sent.current.add(m);
          analytics.scrollMilestone(m, pageType);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, pageType]);

  return null;
}
