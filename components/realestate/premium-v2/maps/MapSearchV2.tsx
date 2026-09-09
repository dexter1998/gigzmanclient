"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { joinPath } from "@/lib/paths";

export interface MapSearchArea {
  slug: string;
  name: string;
}

/**
 * Finds one of the plot maps by name.
 *
 * A combobox over the full list rather than a filter over the grid: there are
 * 75 maps and someone arriving here already knows which sector they want, so
 * the useful action is to jump straight to it. Typing narrows the list, and
 * an exact-enough match on submit navigates without needing a click.
 */
export default function MapSearchV2({
  basePath,
  areas,
}: {
  basePath: string;
  areas: MapSearchArea[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return areas.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 8);
  }, [areas, query]);

  const go = (slug: string) => router.push(joinPath(basePath, `/maps/gurgaon/${slug}`));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim().toLowerCase();
    const exact = areas.find((a) => a.name.toLowerCase() === q);
    const target = exact ?? matches[0];
    if (target) go(target.slug);
  };

  return (
    <div className="relative max-w-xl">
      <form
        onSubmit={submit}
        className="flex overflow-hidden rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-100)] shadow-[var(--shadow-raised)]"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a sector or colony — e.g. Sector 57, DLF Phase 4"
          aria-label="Search plot maps by sector or colony"
          className="min-h-[54px] min-w-0 flex-1 bg-transparent px-4 text-[14px] text-[color:var(--gp-ink)] focus:outline-none"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center gap-2 bg-[color:var(--gp-gold-600)] px-6 text-[13px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Find map</span>
        </button>
      </form>

      {matches.length > 0 ? (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white shadow-[var(--shadow-raised)]">
          {matches.map((area) => (
            <li key={area.slug}>
              <button
                type="button"
                onClick={() => go(area.slug)}
                className="block w-full px-4 py-2.5 text-left text-[14px] text-[color:var(--gp-ink)] hover:bg-[color:var(--gp-cream-200)]"
              >
                {area.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
