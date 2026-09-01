"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

interface ValuationFormProps {
  contactHref: string;
  localities: string[];
}

const FIELD =
  "w-full min-h-[44px] rounded-[6px] border border-line-strong bg-surface px-3 text-[13.5px] text-ink focus:border-navy focus:outline-none";

/**
 * "Know your property's true value" module on the Luxury Advisory template.
 *
 * Collects only what identifies the property, then hands off to the contact
 * form with those details as query params — the phone number is captured
 * there, by the one form that already has consent handling, PAN rejection
 * and the CRM write path. Duplicating a second lead-capture endpoint here
 * would mean duplicating all of that too.
 */
export default function ValuationForm({ contactHref, localities }: ValuationFormProps) {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState("");
  const [locality, setLocality] = useState("");
  const [configuration, setConfiguration] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ intent: "valuation" });
    if (propertyType) params.set("type", propertyType);
    if (locality) params.set("locality", locality);
    if (configuration) params.set("beds", configuration);
    router.push(`${contactHref}?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="rounded-[10px] border border-line bg-surface p-5">
      <p className="display-sm">Know your property&rsquo;s true value</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
        Get a free, no-obligation valuation backed by real market data.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="vf-type" className="mb-1.5 block text-[12.5px] text-ink-muted">
            Property Type
          </label>
          <select id="vf-type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={FIELD}>
            <option value="">Select Type</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vf-locality" className="mb-1.5 block text-[12.5px] text-ink-muted">
            Locality
          </label>
          <select id="vf-locality" value={locality} onChange={(e) => setLocality(e.target.value)} className={FIELD}>
            <option value="">Select Locality</option>
            {localities.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vf-config" className="mb-1.5 block text-[12.5px] text-ink-muted">
            Configuration
          </label>
          <select id="vf-config" value={configuration} onChange={(e) => setConfiguration(e.target.value)} className={FIELD}>
            <option value="">Select Configuration</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} BHK
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 min-h-[46px] w-full rounded-[6px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft"
      >
        Get Free Valuation
      </button>
      <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-subtle">
        You&rsquo;ll be asked for a contact number on the next step. A valuation is an estimate,
        not a formal appraisal.
      </p>
    </form>
  );
}
