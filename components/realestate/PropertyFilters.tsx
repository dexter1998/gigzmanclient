"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { PROPERTY_TYPE_LABELS, PROPERTY_PURPOSE_LABELS } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import PropertyTypeOptions from "@/components/realestate/PropertyTypeOptions";

interface PropertyFiltersProps {
  localities: string[];
}

const FIELD =
  "min-h-[42px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

/**
 * Every filter is a URL search param, so results are shareable and the
 * property list itself stays a plain server component reading `searchParams`.
 */
export default function PropertyFilters({ localities }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = {
    type: searchParams.get("type") ?? "",
    purpose: searchParams.get("purpose") ?? "",
    locality: searchParams.get("locality") ?? "",
    beds: searchParams.get("beds") ?? "",
  };

  const hasActiveFilters = Object.values(current).some(Boolean);

  const apply = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);

    analytics.filterProperties(Object.fromEntries(params.entries()));
  };

  const clear = () => router.push(pathname);

  return (
    <div className="rounded-[12px] border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[12px] font-medium text-ink-muted">
        <SlidersHorizontal className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        Filter properties
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clear}
            className="ml-auto flex items-center gap-1 text-[12px] text-accent hover:underline"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          value={current.purpose}
          onChange={(e) => apply("purpose", e.target.value)}
          className={FIELD}
          aria-label="Purpose"
        >
          <option value="">Buy or Rent</option>
          {Object.entries(PROPERTY_PURPOSE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={current.type}
          onChange={(e) => apply("type", e.target.value)}
          className={FIELD}
          aria-label="Property type"
        >
          <option value="">Property Type</option>
          <PropertyTypeOptions />
        </select>

        <select
          value={current.locality}
          onChange={(e) => apply("locality", e.target.value)}
          className={FIELD}
          aria-label="Locality"
        >
          <option value="">All Localities</option>
          {localities.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={current.beds}
          onChange={(e) => apply("beds", e.target.value)}
          className={FIELD}
          aria-label="Minimum bedrooms"
        >
          <option value="">Any BHK</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ BHK
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
