"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";
import PropertyTypeOptions from "@/components/realestate/PropertyTypeOptions";

interface HeroSearchBarProps {
  action: string;
  localities: string[];
}

const BUDGET_BANDS = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹50 L", value: "5000000" },
  { label: "₹50 L – ₹1 Cr", value: "10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "20000000" },
  { label: "₹2 Cr – ₹5 Cr", value: "50000000" },
];

const FIELD =
  "min-h-[46px] rounded-[6px] border border-line-strong bg-surface px-3 text-[13.5px] text-ink focus:border-navy focus:outline-none";

export default function HeroSearchBar({ action, localities }: HeroSearchBarProps) {
  const router = useRouter();
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set("locality", locality);
    if (propertyType) params.set("type", propertyType);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (beds) params.set("beds", beds);
    router.push(`${action}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[10px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_20px_50px_-24px_rgba(20,50,35,0.35)] sm:p-5"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          className={FIELD}
          aria-label="Location"
        >
          <option value="">All Gurugram</option>
          {localities.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className={FIELD}
          aria-label="Property type"
        >
          <option value="">Property Type</option>
          <PropertyTypeOptions />
        </select>

        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={FIELD}
          aria-label="Budget"
        >
          {BUDGET_BANDS.map((band) => (
            <option key={band.label} value={band.value}>
              {band.label}
            </option>
          ))}
        </select>

        <select value={beds} onChange={(e) => setBeds(e.target.value)} className={FIELD} aria-label="Bedrooms">
          <option value="">Any BHK</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ BHK
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[6px] bg-navy px-6 text-[14px] font-medium text-white hover:bg-navy-soft sm:w-auto"
      >
        Search Properties
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </form>
  );
}
