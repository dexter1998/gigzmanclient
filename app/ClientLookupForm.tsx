"use client";

import { useActionState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { lookupClient, type LookupState } from "./lookup-actions";

const FIELD =
  "w-full min-h-[48px] rounded-[8px] border border-line-strong bg-surface px-3.5 text-[15px] text-ink focus:border-navy focus:outline-none";

export default function ClientLookupForm() {
  const [state, formAction, pending] = useActionState<LookupState, FormData>(lookupClient, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[8px] bg-status-danger-soft px-3.5 py-3 text-[13px] text-status-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-[13px] font-medium text-ink">
          Client ID
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="e.g. high-properties"
          className={FIELD}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Opening" : "Open site"}
        {!pending ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
      </button>
    </form>
  );
}
