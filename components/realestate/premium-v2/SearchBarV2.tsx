"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { joinPath } from "@/lib/paths";

const FIELD =
  "min-h-[54px] w-full appearance-none bg-transparent px-4 text-[14px] text-[color:var(--gp-ink)] focus:outline-none";
const LABEL = "px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]";

const PROPERTY_TYPES = [
  { value: "", label: "All types" },
  { value: "apartment", label: "Apartment" },
  { value: "farmhouse", label: "Farm house" },
  { value: "villa", label: "Villa" },
  { value: "builder_floor", label: "Builder floor" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
  { value: "sco", label: "SCO / Retail" },
];

/** Ceilings, in rupees, matched to how Gurugram buyers describe a budget. */
const BUDGETS = [
  { value: "", label: "Any budget" },
  { value: "5000000", label: "Up to ₹50 L" },
  { value: "10000000", label: "Up to ₹1 Cr" },
  { value: "20000000", label: "Up to ₹2 Cr" },
  { value: "50000000", label: "Up to ₹5 Cr" },
  { value: "100000000", label: "Up to ₹10 Cr" },
];

/**
 * Location / type / budget search, above the listings and the plot maps.
 *
 * Every field writes a URL search param that `PropertyFiltersV2` and the
 * listing already read, so this adds an entry point rather than a second
 * filtering mechanism — a result page reached from here can be shared, and
 * the filter panel below it opens in the same state.
 */
export default function SearchBarV2({
  basePath,
  localities,
  action = "/properties",
}: {
  basePath: string;
  localities: string[];
  /** Where the search lands; the maps page sends people to its own index. */
  action?: string;
}) {
  const router = useRouter();
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set("locality", locality);
    if (type) params.set("type", type);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const query = params.toString();
    router.push(joinPath(basePath, action) + (query ? `?${query}` : ""));
  };

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 overflow-hidden rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-100)] shadow-[var(--shadow-raised)] sm:grid-cols-[1.2fr_1fr_1fr_auto]"
    >
      <label className="flex flex-col border-b border-[color:var(--gp-border)] sm:border-b-0 sm:border-r">
        <span className={LABEL}>Location</span>
        <select className={FIELD} value={locality} onChange={(e) => setLocality(e.target.value)}>
          <option value="">All locations</option>
          {localities.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col border-b border-[color:var(--gp-border)] sm:border-b-0 sm:border-r">
        <span className={LABEL}>Property type</span>
        <select className={FIELD} value={type} onChange={(e) => setType(e.target.value)}>
          {PROPERTY_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col border-b border-[color:var(--gp-border)] sm:border-b-0 sm:border-r">
        <span className={LABEL}>Budget</span>
        <select className={FIELD} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
          {BUDGETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="flex min-h-[62px] items-center justify-center gap-2 bg-[color:var(--gp-gold-600)] px-7 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </button>
    </form>
  );
}
