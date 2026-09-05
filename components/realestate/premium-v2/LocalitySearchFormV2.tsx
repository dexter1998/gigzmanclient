"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { joinPath } from "@/lib/paths";
import { analytics } from "@/lib/analytics";

interface LocalityOption {
  name: string;
  slug: string;
}

export default function LocalitySearchFormV2({
  basePath,
  localityOptions,
}: {
  basePath: string;
  localityOptions: LocalityOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      router.push(joinPath(basePath, "/properties"));
      return;
    }

    // A direct hit against one of the five tracked corridors sends the
    // visitor straight to its dedicated page; anything else (a sector
    // number, a builder floor address) falls back to the properties
    // listing's free-text search rather than a dead end.
    const matched = localityOptions.find(
      (loc) =>
        loc.name.toLowerCase() === term.toLowerCase() ||
        loc.name.toLowerCase().includes(term.toLowerCase()),
    );

    analytics.searchSubmit("localities_index");

    if (matched) {
      router.push(joinPath(basePath, `/localities/${matched.slug}`));
    } else {
      router.push(joinPath(basePath, `/properties?search=${encodeURIComponent(term)}`));
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-stretch overflow-hidden rounded-[var(--gp-radius-sm)] border border-white/25 bg-white/95 focus-within:border-[color:var(--gp-gold-600)]"
    >
      <label htmlFor="gp-locality-search" className="sr-only">
        Search sector, locality or corridor
      </label>
      <input
        id="gp-locality-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search sector, locality or corridor…"
        className="min-h-[54px] min-w-0 flex-1 bg-transparent px-4 text-[14px] text-[color:var(--gp-ink)] focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex min-h-[54px] shrink-0 items-center justify-center gap-1.5 bg-[color:var(--gp-gold-600)] px-5 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] sm:px-6"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        Explore
      </button>
    </form>
  );
}
