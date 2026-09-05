"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/**
 * Filters render once and are shared between the desktop sidebar and this
 * drawer via `children` — only the open/close chrome and focus handling
 * live here, so the actual filter logic (`PropertyFiltersV2`) is never
 * duplicated between breakpoints.
 */
export default function MobileFilterDrawerV2({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("select, button, input")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] text-[13.5px] font-medium text-[color:var(--gp-ink)]"
      >
        <SlidersHorizontal className="h-4 w-4 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
        Filter &amp; Sort
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filter properties">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[var(--gp-radius-lg)] bg-[color:var(--gp-cream-100)] p-5 pb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-[18px] text-[color:var(--gp-ink)]">Filter &amp; Sort</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gp-border)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
