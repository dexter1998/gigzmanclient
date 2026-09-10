"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, CornerDownLeft, Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";

export const OPEN_ASK_AI_EVENT = "gp:open-ask-ai";

/** Opens the assistant from anywhere — same pattern as the lead popup, so a
 *  Server Component can carry the button without a client wrapper. */
export function openAskAi(mode: "ask" | "summarize" = "ask") {
  window.dispatchEvent(new CustomEvent(OPEN_ASK_AI_EVENT, { detail: { mode } }));
}

const SUGGESTIONS = [
  "What plots do you have in New Gurugram?",
  "Which corridor suits a ₹2 Cr budget?",
  "What documents do I need to buy a resale flat?",
  "Show me the Sector 57 plot map",
];

/**
 * Answers questions about this site, from this site's data.
 *
 * The answer is rendered as text with its links made clickable, not as
 * arbitrary HTML: the model's output is untrusted input, and the one thing it
 * is asked to produce — a path from the context — is the one thing worth
 * turning into an anchor.
 */
export default function AskAiV2({ tenantSlug }: { tenantSlug: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ask" | "summarize">("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const next = (event as CustomEvent<{ mode?: "ask" | "summarize" }>).detail?.mode ?? "ask";
      setMode(next);
      setOpen(true);
      setError("");
      if (next === "summarize") {
        setAnswer("");
        void run("Summarise this page", "summarize");
      }
    };
    window.addEventListener(OPEN_ASK_AI_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASK_AI_EVENT, onOpen);
    // `run` is stable for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    if (mode === "ask") inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, mode]);

  async function run(text: string, runMode: "ask" | "summarize") {
    const q = text.trim();
    if (!q || pending) return;
    setPending(true);
    setError("");
    setAnswer("");
    analytics.ctaClick(runMode === "summarize" ? "summarize_ai" : "ask_ai", "site", "assistant");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: q,
          tenant: tenantSlug,
          mode: runMode,
          page: window.location.pathname,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "That did not work. Try again.");
      else setAnswer(data.answer);
    } catch {
      setError("Could not reach the assistant. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Ask AI"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-[var(--gp-radius-lg)] bg-white p-5 shadow-[var(--shadow-raised)] sm:max-w-2xl sm:rounded-[var(--gp-radius-lg)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
            <h2 className="font-display text-[19px] text-[color:var(--gp-ink)]">
              {mode === "summarize" ? "Page summary" : "Ask about this site"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="-m-2 flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--gp-muted)] hover:text-[color:var(--gp-ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "ask" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(question, "ask");
            }}
            className="mt-4"
          >
            <textarea
              ref={inputRef}
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void run(question, "ask");
                }
              }}
              placeholder="Ask about localities, budgets, paperwork, maps…"
              className="w-full resize-none rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] p-3.5 text-[14px] text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11.5px] text-[color:var(--gp-muted)]">
                Answers come from this site&rsquo;s own listings and pages.
              </p>
              <button
                type="submit"
                disabled={pending || !question.trim()}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
                Ask
              </button>
            </div>
          </form>
        ) : null}

        {mode === "ask" && !answer && !pending ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuestion(s);
                  void run(s, "ask");
                }}
                className="rounded-full border border-[color:var(--gp-border)] px-3.5 py-2 text-[12.5px] text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-600)]"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {pending ? (
          <p className="mt-5 flex items-center gap-2 text-[13.5px] text-[color:var(--gp-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Reading the site…
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-5 text-[13.5px] text-status-danger">
            {error}
          </p>
        ) : null}

        {answer ? <AnswerBody text={answer} /> : null}
      </div>
    </div>
  );
}

/**
 * Renders the answer, turning `[label](/path)` into real links and leaving
 * everything else as plain text. Only same-origin paths become anchors — the
 * model is told to use paths from the context, and anything else it produces
 * is not something to hand a visitor as a link.
 */
function AnswerBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="mt-5 space-y-3 border-t border-[color:var(--gp-border)] pt-5">
      {blocks.map((block, i) => (
        <p key={i} className="text-[14px] leading-relaxed text-[color:var(--gp-body)]">
          {renderInline(block)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string) {
  const out: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <a
        key={`${m.index}-${m[2]}`}
        href={m[2]}
        className="font-semibold text-[color:var(--gp-forest-900)] underline decoration-[color:var(--gp-gold-600)] underline-offset-2 hover:text-[color:var(--gp-gold-600)]"
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
