"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";
import PropertyTypeOptions from "@/components/realestate/PropertyTypeOptions";
import AreaInput from "@/components/realestate/AreaInput";
import { PROPERTY_TYPE_GROUPS } from "@/lib/format";

interface ValuationFormProps {
  contactHref: string;
  localities: string[];
  /**
   * The form is shared with a template whose palette is navy-on-white. On
   * premium-v2 the same markup has to wear gold-on-cream, so the three
   * surfaces that carry brand colour are overridable rather than forked.
   */
  cardClassName?: string;
  fieldClassName?: string;
  submitClassName?: string;
  /** Hides the heading when the section around it already carries one. */
  showHeading?: boolean;
}

const DEFAULT_FIELD =
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
export default function ValuationForm({
  contactHref,
  localities,
  cardClassName = "rounded-[10px] border border-line bg-surface p-5",
  fieldClassName,
  submitClassName = "mt-4 min-h-[46px] w-full rounded-[6px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft",
  showHeading = true,
}: ValuationFormProps) {
  const FIELD = fieldClassName ?? DEFAULT_FIELD;
  const router = useRouter();
  const [propertyType, setPropertyType] = useState("");
  const [locality, setLocality] = useState("");
  const [configuration, setConfiguration] = useState("");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("square-yard");

  /**
   * BHK only describes a home. Asking "how many bedrooms" about a plot, a
   * shop or an acre of farmland is unanswerable, and this form used to ask it
   * of every type — so anything that was not a flat had to be described in
   * the message box, or not at all. Residential types keep the BHK list;
   * everything else is sized instead.
   */
  const residentialTypes =
    PROPERTY_TYPE_GROUPS.find((g) => g.label === "Residential")?.types ?? [];
  const sizedByArea = propertyType !== "" && !residentialTypes.includes(propertyType);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ intent: "valuation" });
    if (propertyType) params.set("type", propertyType);
    if (locality) params.set("locality", locality);
    if (!sizedByArea && configuration) params.set("beds", configuration);
    if (sizedByArea && area) {
      params.set("area", area);
      params.set("areaUnit", areaUnit);
    }
    router.push(`${contactHref}?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className={cardClassName}>
      {showHeading ? (
        <>
          <p className="display-sm">Know your property&rsquo;s true value</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            Get a free, no-obligation valuation backed by real market data.
          </p>
        </>
      ) : null}

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="vf-type" className="mb-1.5 block text-[12.5px] text-ink-muted">
            Property Type
          </label>
          <select id="vf-type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={FIELD}>
            <option value="">Select Type</option>
            <PropertyTypeOptions />
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
            {sizedByArea ? "Plot / built-up size" : "Configuration"}
          </label>
          {sizedByArea ? (
            <AreaInput
              id="vf-config"
              value={area}
              unit={areaUnit}
              onValueChange={setArea}
              onUnitChange={setAreaUnit}
              fieldClassName={FIELD}
            />
          ) : (
            <select
              id="vf-config"
              value={configuration}
              onChange={(e) => setConfiguration(e.target.value)}
              className={FIELD}
            >
              <option value="">Select Configuration</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} BHK
                </option>
              ))}
              <option value="6+">6 BHK or larger</option>
              <option value="custom">Something else — I&rsquo;ll describe it</option>
            </select>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={submitClassName}
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
