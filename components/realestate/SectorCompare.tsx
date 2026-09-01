"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface ComparableLocality {
  slug: string;
  name: string;
  avgPricePerSqft: number | null;
  yoyChangePercent: number | null;
  rentalYieldPercent: number | null;
  activeProjects: number | null;
  bestFor: string | null;
}

interface SectorCompareProps {
  localities: ComparableLocality[];
}

const METRICS = [
  { key: "avgPricePerSqft", label: "Average Price (₹/sq.ft)" },
  { key: "yoyChangePercent", label: "YoY Appreciation" },
  { key: "rentalYieldPercent", label: "Rental Yield" },
  { key: "activeProjects", label: "Active Projects" },
  { key: "bestFor", label: "Best For" },
] as const;

const FIELD =
  "w-full min-h-[42px] rounded-[6px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

function display(locality: ComparableLocality, key: (typeof METRICS)[number]["key"]) {
  const value = locality[key];
  if (value === null || value === undefined || value === "") return "—";
  if (key === "avgPricePerSqft") return `₹${Number(value).toLocaleString("en-IN")}`;
  if (key === "yoyChangePercent") return `${Number(value) >= 0 ? "+" : ""}${value}%`;
  if (key === "rentalYieldPercent") return `${value}%`;
  return String(value);
}

/**
 * Compare up to three localities side by side. Purely client-side over data
 * already fetched server-side — selecting a locality never refetches.
 */
export default function SectorCompare({ localities }: SectorCompareProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const add = (slug: string) => {
    if (!slug || selected.includes(slug) || selected.length >= 3) return;
    setSelected([...selected, slug]);
  };
  const remove = (slug: string) => setSelected(selected.filter((s) => s !== slug));

  const chosen = selected
    .map((slug) => localities.find((l) => l.slug === slug))
    .filter((l): l is ComparableLocality => Boolean(l));

  const available = localities.filter((l) => !selected.includes(l.slug));

  return (
    <div className="rounded-[10px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="compare-add" className="text-[13px] font-medium text-ink">
          Add a locality
        </label>
        <select
          id="compare-add"
          value=""
          onChange={(e) => add(e.target.value)}
          disabled={selected.length >= 3 || available.length === 0}
          className={`${FIELD} max-w-[260px] disabled:opacity-50`}
        >
          <option value="">
            {selected.length >= 3 ? "Maximum 3 selected" : "Select a locality…"}
          </option>
          {available.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
        <span className="text-[12px] text-ink-subtle">{selected.length} of 3 selected</span>
      </div>

      {chosen.length === 0 ? (
        <p className="mt-5 rounded-[8px] border border-dashed border-line px-4 py-8 text-center text-[13px] text-ink-subtle">
          Select up to three localities to compare price, appreciation, yield and inventory
          side by side.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2.5 pr-4 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
                  Metric
                </th>
                {chosen.map((locality) => (
                  <th key={locality.slug} scope="col" className="py-2.5 pr-4">
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink">{locality.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(locality.slug)}
                        aria-label={`Remove ${locality.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-[4px] text-ink-subtle hover:bg-tint hover:text-navy"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {METRICS.map((metric) => (
                <tr key={metric.key}>
                  <th scope="row" className="py-3 pr-4 text-[12.5px] font-normal text-ink-muted">
                    {metric.label}
                  </th>
                  {chosen.map((locality) => (
                    <td key={locality.slug} className="py-3 pr-4 text-[13px] font-medium text-ink">
                      {display(locality, metric.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
