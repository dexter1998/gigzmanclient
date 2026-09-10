"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { joinPath } from "@/lib/paths";
import PropertyTypeOptions from "@/components/realestate/PropertyTypeOptions";
import LocationCombobox, { type LocationSuggestion } from "./LocationCombobox";

/**
 * Location / type search, above the listings and the plot maps.
 *
 * Location is a typed input rather than a `<select>`: the inventory spans 153
 * sectors, and a dropdown that long is unusable on a phone — people know the
 * sector they want and would rather type "57" than scroll to it. What they
 * type becomes `q`, which the listing already matches against title, locality,
 * sector and corridor, so a colony name works as well as a sector number.
 *
 * Budget moved out of this bar and stays in the filter panel below. It was the
 * one field here that nobody can answer before seeing prices, and dropping it
 * is what makes the three remaining controls fit one row on a phone.
 *
 * Every field writes a URL search param the listing and `PropertyFiltersV2`
 * already read, so this is an entry point rather than a second filtering
 * mechanism: results stay shareable and the filter panel opens in the same
 * state.
 */
export default function SearchBarV2({
  basePath,
  suggestions,
  action = "/properties",
}: {
  basePath: string;
  suggestions: LocationSuggestion[];
  /** Where the search lands; the maps page sends people to its own index. */
  action?: string;
}) {
  const router = useRouter();
  const [where, setWhere] = useState("");
  const [type, setType] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (where.trim()) params.set("q", where.trim());
    if (type) params.set("type", type);
    const query = params.toString();
    router.push(joinPath(basePath, action) + (query ? `?${query}` : ""));
  };

  const field =
    "min-h-[54px] w-full appearance-none bg-transparent px-4 text-[14px] text-[color:var(--gp-ink)] " +
    "placeholder:text-[color:var(--gp-muted)] focus:outline-none";

  return (
    <form
      onSubmit={submit}
      className="overflow-visible rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-100)] shadow-[var(--shadow-raised)]"
    >
      {/* Input and type share a row at every width; only the button wraps
          below on a phone, which is the layout that keeps the tap target
          full-width without squeezing the two fields into 40% each. */}
      <div className="grid grid-cols-[1.4fr_1fr] sm:grid-cols-[1.6fr_1fr_auto]">
        <label className="flex min-w-0 flex-col border-r border-[color:var(--gp-border)]">
          <span className="px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
            Location
          </span>
          <LocationCombobox
            suggestions={suggestions}
            value={where}
            onChange={setWhere}
            inputClassName={field}
          />
        </label>

        <label className="flex min-w-0 flex-col sm:border-r sm:border-[color:var(--gp-border)]">
          <span className="px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
            Property type
          </span>
          <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <PropertyTypeOptions />
          </select>
        </label>

        <button
          type="submit"
          className="col-span-2 flex min-h-[54px] items-center justify-center gap-2 border-t border-[color:var(--gp-border)] bg-[color:var(--gp-gold-600)] px-7 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] sm:col-span-1 sm:min-h-[62px] sm:border-t-0"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Search
        </button>
      </div>
    </form>
  );
}
