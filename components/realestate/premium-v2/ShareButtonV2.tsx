"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { analytics } from "@/lib/analytics";

/**
 * Share this page.
 *
 * Uses the Web Share API where the browser has it, which on a phone opens the
 * OS sheet — WhatsApp included, and WhatsApp is how Gurugram property links
 * actually travel. Everywhere else it falls back to copying the link, and to
 * explicit WhatsApp and X links so the action is never a dead button.
 *
 * The URL is read at click time rather than rendered in, so the component
 * stays valid on a prerendered page served from the CDN.
 */
export default function ShareButtonV2({
  title,
  label = "Share",
  className = "",
  pageType = "page",
}: {
  /** Prefilled as the message subject; falls back to the document title. */
  title?: string;
  label?: string;
  className?: string;
  pageType?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // `navigator.share` must be read after mount: it differs between the
  // prerender and the browser, and reading it during render would make the
  // two disagree.
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;
    const text = title ?? document.title;
    analytics.ctaClick("share", pageType, "share_button");
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // Cancelled, or the sheet refused — fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-[42px] items-center gap-2 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] px-4 text-[13px] font-semibold text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-600)]"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
            Link copied
          </>
        ) : (
          <>
            {canShare ? <Share2 className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
            {label}
          </>
        )}
      </button>
    </div>
  );
}
