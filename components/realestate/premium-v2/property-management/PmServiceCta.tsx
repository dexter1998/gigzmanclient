"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../gp-primitives";
import { openLeadPopup } from "../leadPopup";

/**
 * Every "take this service" action on the property-management page.
 *
 * They all open the shared lead popup rather than linking to the consultation
 * form at the bottom of the page: an owner who has read as far as "raise a
 * request" has already decided, and sending them to hunt for a form loses
 * them. One client component covers all of them, which keeps every section
 * that uses it a Server Component.
 */
export default function PmServiceCta({
  children,
  variant = "primary",
  withArrow = true,
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "outlineDark" | "quiet";
  withArrow?: boolean;
  className?: string;
}) {
  // `uppercase` is not in the shared base: pairing it with `normal-case` on
  // the quiet variant leaves two text-transform utilities on one element, and
  // which one wins is decided by their order in the generated stylesheet, not
  // by the order they appear in the class string. Setting it per variant
  // keeps exactly one of them on the element.
  const base =
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] text-[13.5px] font-semibold transition-colors";

  const styles = {
    primary:
      "uppercase tracking-[0.04em] bg-[color:var(--gp-gold-600)] px-7 text-[color:var(--gp-forest-950)] hover:bg-[color:var(--gp-gold-300)]",
    outline:
      "uppercase tracking-[0.04em] border border-white/35 px-7 text-white hover:border-white",
    // Same button on a cream section. A separate variant rather than an
    // override on `outline`, for the reason `uppercase` moved out of the
    // base: two competing `text-*` utilities on one element resolve by
    // stylesheet order, so the white one can win and leave the label
    // invisible on cream.
    outlineDark:
      "uppercase tracking-[0.04em] border border-[color:var(--gp-forest-900)]/30 px-7 text-[color:var(--gp-ink)] hover:border-[color:var(--gp-forest-900)]",
    // No colour of its own: every caller sets one to match its section, and a
    // default here would be a second `text-*` utility competing with theirs.
    quiet: "min-h-0 gap-1.5 px-0 text-[13px]",
  }[variant];

  return (
    <button
      type="button"
      onClick={() => openLeadPopup("propertyManagement")}
      className={cn(base, styles, className)}
    >
      {children}
      {withArrow ? (
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
    </button>
  );
}
