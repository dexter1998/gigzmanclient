"use client";

import { AREA_UNITS } from "@/lib/calculators/area-units";

/**
 * A size field with its unit beside it.
 *
 * Gurugram does not quote everything in square feet: plots and builder floors
 * are priced in gaj, agricultural land in acres or bighas, and HSVP paperwork
 * in square metres. A form that only accepts square feet makes the person
 * convert before they can answer, which is the point at which they leave.
 *
 * Units come from the area converter's own table, so the two cannot disagree
 * about what a marla is.
 */
export default function AreaInput({
  value,
  unit,
  onValueChange,
  onUnitChange,
  id,
  placeholder = "Size",
  className = "",
  fieldClassName,
}: {
  value: string;
  unit: string;
  onValueChange: (v: string) => void;
  onUnitChange: (u: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  fieldClassName: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        className={`${fieldClassName} flex-1`}
      />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value)}
        aria-label="Unit"
        className={`${fieldClassName} w-[42%] shrink-0`}
      >
        {AREA_UNITS.map((u) => (
          <option key={u.slug} value={u.slug}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
