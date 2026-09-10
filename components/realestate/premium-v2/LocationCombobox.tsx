"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Type-ahead location input.
 *
 * Suggestions are the sectors, localities and corridors that actually carry
 * listings — not a general place dataset. A general one is tempting, but the
 * India-wide packages are city-level ("Gurgaon") and several megabytes: they
 * cannot suggest "Sector 57", which is the search people actually run here,
 * and every suggestion they add is a place with no inventory behind it.
 *
 * A plain `<input>` with a `<datalist>` would be less code, but Safari and
 * most Android browsers render it inconsistently and it cannot show the "12
 * listings" hint that tells someone the search is worth running.
 */
export interface LocationSuggestion {
  /** What the buyer sees and types against. */
  label: string;
  /** "Sector" | "Locality" | "Corridor" — shown as a hint, not searched. */
  kind: string;
  count: number;
}

export default function LocationCombobox({
  suggestions,
  value,
  onChange,
  placeholder = "Sector, locality or corridor",
  className = "",
  inputClassName = "",
}: {
  suggestions: LocationSuggestion[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    // Prefix matches first: someone typing "57" wants Sector 57 at the top,
    // not "Sector 157" just because it also contains the digits.
    const starts: LocationSuggestion[] = [];
    const contains: LocationSuggestion[] = [];
    for (const s of suggestions) {
      const l = s.label.toLowerCase();
      if (l.startsWith(q)) starts.push(s);
      else if (l.includes(q)) contains.push(s);
    }
    return [...starts, ...contains].slice(0, 8);
  }, [suggestions, value]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const pick = (s: LocationSuggestion) => {
    onChange(s.label);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open && active >= 0) {
            // Only swallow Enter when a suggestion is highlighted; otherwise
            // it must still submit the form the input sits in.
            e.preventDefault();
            pick(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={inputClassName}
      />

      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white py-1 shadow-[var(--shadow-raised)]"
        >
          {matches.map((s, i) => (
            <li key={`${s.kind}-${s.label}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(s)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] ${
                  i === active ? "bg-[color:var(--gp-cream-200)]" : "bg-transparent"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[color:var(--gp-ink)]">{s.label}</span>
                <span className="shrink-0 text-[11.5px] text-[color:var(--gp-muted)]">
                  {s.kind} · {s.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
