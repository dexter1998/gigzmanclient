"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { amenityIcon } from "./amenity-icons";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_PURPOSE_LABELS,
  PROPERTY_STATUS_LABELS,
} from "@/lib/format";
import { analytics } from "@/lib/analytics";

interface PropertyFiltersV2Props {
  localities: string[];
  onNavigate?: () => void; // closes the mobile drawer after a filter is applied
}

const BUDGET_BANDS = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹50 L", value: "5000000" },
  { label: "₹50 L – ₹1 Cr", value: "10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "20000000" },
  { label: "₹2 Cr – ₹5 Cr", value: "50000000" },
  { label: "Above ₹5 Cr", value: "1000000000" },
];

const AMENITY_OPTIONS = [
  "Clubhouse",
  "Swimming Pool",
  "24x7 Security",
  "Power Backup",
  "Covered Parking",
  "Gymnasium",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

/**
 * `appearance-none` plus our own chevron: the native control paints its arrow
 * hard against the right border and lets the label run underneath it, which is
 * what clipped "Property Type" to "Property Typ". `pr-10` reserves the room the
 * arrow sits in.
 */
const FIELD =
  "w-full min-h-[50px] appearance-none truncate rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] " +
  "bg-[color:var(--gp-cream-100)] py-2.5 pl-3.5 pr-10 text-[13.5px] text-[color:var(--gp-ink)] " +
  "focus:border-[color:var(--gp-gold-600)] focus:outline-none";

function Field({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-w-0">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--gp-muted)]"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Every filter is a URL search param — same discipline as the shared
 * `PropertyFilters.tsx` this restyles — so results stay shareable and the
 * listing itself is a plain server component reading `searchParams`.
 * `amenities`/`verified`/`sort` have no server-side query support in
 * `getProperties()`, so `PremiumV2PropertiesPage` applies them client-side
 * after the DB fetch; they still live in the URL like every other filter.
 */
export default function PropertyFiltersV2({ localities, onNavigate }: PropertyFiltersV2Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = {
    purpose: searchParams.get("purpose") ?? "",
    type: searchParams.get("type") ?? "",
    locality: searchParams.get("locality") ?? "",
    beds: searchParams.get("beds") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    status: searchParams.get("status") ?? "",
    sort: searchParams.get("sort") ?? "",
    verified: searchParams.get("verified") ?? "",
    amenities: (searchParams.get("amenities") ?? "").split(",").filter(Boolean),
  };

  const hasActiveFilters =
    current.purpose ||
    current.type ||
    current.locality ||
    current.beds ||
    current.maxPrice ||
    current.status ||
    current.verified ||
    current.amenities.length > 0;

  const apply = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // any filter change restarts pagination
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    analytics.filterProperties(Object.fromEntries(params.entries()));
    onNavigate?.();
  };

  const toggleAmenity = (amenity: string) => {
    const next = current.amenities.includes(amenity)
      ? current.amenities.filter((a) => a !== amenity)
      : [...current.amenities, amenity];
    apply("amenities", next.join(","));
  };

  const clear = () => {
    router.push(pathname);
    onNavigate?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">Refine Search</p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-[12.5px] text-[color:var(--gp-gold-600)] hover:underline"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>

      {/* One per row: the desktop rail is 280px, so two columns leave ~130px a
          field — not enough for "All Localities" once the chevron has its room,
          and the label truncated instead. */}
      <div className="grid grid-cols-1 gap-3">
        <Field>
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
        </Field>

        <Field>

        <select
          value={current.type}
          onChange={(e) => apply("type", e.target.value)}
          className={FIELD}
          aria-label="Property type"
        >
          <option value="">Property Type</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        </Field>

        <Field>

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
        </Field>

        <Field>

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
        </Field>

        <Field>

        <select
          value={current.maxPrice}
          onChange={(e) => apply("maxPrice", e.target.value)}
          className={FIELD}
          aria-label="Budget"
        >
          {BUDGET_BANDS.map((band) => (
            <option key={band.label} value={band.value}>
              {band.label}
            </option>
          ))}
        </select>
        </Field>

        <Field>

        <select
          value={current.status}
          onChange={(e) => apply("status", e.target.value)}
          className={FIELD}
          aria-label="Status"
        >
          <option value="">Any Status</option>
          {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        </Field>
      </div>

      <div>
        <p className="mb-2 text-[12.5px] font-medium text-[color:var(--gp-ink)]">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const active = current.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAmenity(amenity)}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                  active
                    ? "border-[color:var(--gp-gold-600)] bg-[color:var(--gp-gold-600)] text-white"
                    : "border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)]"
                }`}
              >
                {(() => {
                  const Icon = amenityIcon(amenity);
                  return (
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${active ? "" : "text-[color:var(--gp-gold-600)]"}`}
                      aria-hidden="true"
                    />
                  );
                })()}
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex min-h-[38px] items-center gap-2 text-[13px] text-[color:var(--gp-body)]">
        <input
          type="checkbox"
          checked={current.verified === "1"}
          onChange={(e) => apply("verified", e.target.checked ? "1" : "")}
          className="h-4 w-4 accent-[color:var(--gp-gold-600)]"
        />
        RERA verified only
      </label>

      <div>
        <p className="mb-2 text-[12.5px] font-medium text-[color:var(--gp-ink)]">Sort by</p>
        <Field>
        <select
          value={current.sort}
          onChange={(e) => apply("sort", e.target.value)}
          className={`${FIELD} w-full`}
          aria-label="Sort"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        </Field>
      </div>
    </div>
  );
}
