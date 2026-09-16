"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, Sparkles } from "lucide-react";
import { analytics } from "@/lib/analytics";

/**
 * "Summarise with AI" — a menu that hands this page to whichever assistant the
 * reader already uses, rather than answering in a panel of our own.
 *
 * The mechanism is a prefilled deep link: ChatGPT, Claude and Perplexity each
 * read the prompt out of a `q` query parameter, so the assistant opens with
 * the question already in its composer and the page URL in it. They can fetch
 * the page themselves from there.
 *
 *   ChatGPT     https://chatgpt.com/?q=…
 *   Claude      https://claude.ai/new?q=…
 *   Perplexity  https://www.perplexity.ai/search/new?q=…
 *
 * Gemini is the exception and has to be handled differently: it supports no
 * prefill parameter at all — the extensions that appear to add one are pasting
 * into the composer from the clipboard. So Gemini copies the prompt and opens
 * the app, and the menu says so rather than pretending the link carried it.
 *
 * The prompt is capped below the length at which clients start truncating a
 * query string. Past that we fall back to the clipboard for every platform,
 * because a silently cut-off prompt is worse than an explicit paste.
 */

const MAX_QUERY_CHARS = 1800;

type Target = {
  id: string;
  name: string;
  /** Builds the destination. `null` means this platform cannot take a prefill. */
  href: ((prompt: string) => string) | null;
  /** What the row says under the name. */
  note: string;
};

const TARGETS: Target[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    href: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
    note: "Opens with the question ready",
  },
  {
    id: "claude",
    name: "Claude",
    href: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    note: "Opens with the question ready",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    href: (prompt) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(prompt)}`,
    note: "Searches the page straight away",
  },
  {
    id: "gemini",
    name: "Gemini",
    href: null,
    note: "Copies the prompt — paste it in Gemini",
  },
];

const GEMINI_APP = "https://gemini.google.com/app";

/** What we ask the assistant. Short on purpose — long prompts get truncated. */
function buildPrompt(): string {
  const url = window.location.href;
  // Titles here end in a separator plus the firm name — "Dune Plots — High
  // Properties", "Farmhouses in Sohna | Evergreen". Either separator, and only
  // the last one, so a hyphen inside the page name survives.
  const title = document.title.replace(/\s+[|—–]\s+[^|—–]*$/, "").trim();
  const prompt = [
    `Read this page and summarise it for me: ${url}`,
    "",
    title ? `It is "${title}" on a Gurugram real-estate site.` : "",
    "Tell me what is on offer, the key numbers (price, plot size, location, RERA or ownership status), and what I should check or ask before I enquire.",
  ]
    .filter(Boolean)
    .join("\n");
  return prompt.slice(0, MAX_QUERY_CHARS);
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function SummariseWithAiV2({
  variant = "bar",
  onNavigate,
}: {
  /** `bar` is the desktop top strip; `sheet` is a row in the mobile menu. */
  variant?: "bar" | "sheet";
  /** Lets the mobile sheet close itself once a target is chosen. */
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 2600);
    return () => clearTimeout(timer);
  }, [copied]);

  const choose = async (target: Target) => {
    const prompt = buildPrompt();
    analytics.ctaClick(`summarise_ai_${target.id}`, "header", variant);

    if (!target.href) {
      // Gemini: no prefill parameter exists, so carry it on the clipboard.
      const ok = await copy(prompt);
      setCopied(ok ? target.id : null);
      window.open(GEMINI_APP, "_blank", "noopener,noreferrer");
      if (!ok) window.prompt("Copy this, then paste it into Gemini:", prompt);
      setTimeout(() => {
        setOpen(false);
        onNavigate?.();
      }, ok ? 1200 : 0);
      return;
    }

    window.open(target.href(prompt), "_blank", "noopener,noreferrer");
    setOpen(false);
    onNavigate?.();
  };

  const onBar = variant === "bar";

  return (
    <div ref={rootRef} className={onBar ? "relative" : "relative w-full"}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        className={
          onBar
            ? "inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/75 transition-colors hover:text-[color:var(--gp-gold-300)]"
            : "flex min-h-[48px] w-full items-center gap-3 rounded-[var(--gp-radius-sm)] px-2 py-3 text-left text-[15px] text-white/85"
        }
      >
        <Sparkles
          className={onBar ? "h-3.5 w-3.5" : "h-4 w-4 shrink-0 text-[color:var(--gp-gold-300)]"}
          aria-hidden="true"
        />
        Summarise with AI
        <ChevronDown
          className={`${onBar ? "h-3 w-3" : "ml-auto h-4 w-4"} transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={
            onBar
              ? "absolute right-0 top-full z-50 mt-2 w-[268px] overflow-hidden rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white shadow-[0_18px_50px_rgba(10,46,44,0.25)]"
              : "mt-1 overflow-hidden rounded-[var(--gp-radius-md)] border border-white/15 bg-[color:var(--gp-forest-900)]"
          }
        >
          <p
            className={`px-4 pt-3 text-[11px] uppercase tracking-[0.08em] ${
              onBar ? "text-[color:var(--gp-muted)]" : "text-white/45"
            }`}
          >
            Open this page in
          </p>
          <ul className="p-2 pt-1.5">
            {TARGETS.map((target) => (
              <li key={target.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => choose(target)}
                  className={`flex w-full items-start gap-3 rounded-[var(--gp-radius-sm)] px-2.5 py-2 text-left transition-colors ${
                    onBar ? "hover:bg-[color:var(--gp-cream-200)]" : "hover:bg-white/10"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[13.5px] font-semibold ${
                        onBar ? "text-[color:var(--gp-ink)]" : "text-white"
                      }`}
                    >
                      {target.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11.5px] leading-snug ${
                        onBar ? "text-[color:var(--gp-muted)]" : "text-white/55"
                      }`}
                    >
                      {copied === target.id ? "Copied — paste it in Gemini" : target.note}
                    </span>
                  </span>
                  {copied === target.id ? (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--gp-success)]" aria-hidden="true" />
                  ) : target.href ? (
                    <ExternalLink
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${onBar ? "text-[color:var(--gp-muted)]" : "text-white/40"}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <Copy
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${onBar ? "text-[color:var(--gp-muted)]" : "text-white/40"}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
