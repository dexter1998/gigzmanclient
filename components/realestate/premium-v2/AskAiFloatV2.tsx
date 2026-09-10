"use client";

import { Sparkles } from "lucide-react";
import { openAskAi } from "./AskAiV2";

/**
 * The assistant's floating entry point, above the WhatsApp bubble.
 *
 * `bottom-[176px]` clears both floats already in that corner: WhatsApp sits at
 * the bottom and the callback pill at 104px. Below `sm` the mobile action bar
 * owns the bottom edge, so this moves up out of its way rather than hiding —
 * the request was for the assistant to be reachable on a phone too.
 */
export default function AskAiFloatV2() {
  return (
    <button
      type="button"
      onClick={() => openAskAi("ask")}
      aria-label="Ask AI about this site"
      className="fixed bottom-[92px] right-5 z-40 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[color:var(--gp-gold-600)] px-4 text-[13px] font-semibold text-[color:var(--gp-forest-950)] shadow-[0_10px_30px_-8px_rgba(10,46,44,0.55)] transition-colors hover:bg-[color:var(--gp-gold-300)] sm:bottom-[176px]"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      Ask AI
    </button>
  );
}
