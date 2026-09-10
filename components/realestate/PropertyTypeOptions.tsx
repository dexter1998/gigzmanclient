import { PROPERTY_TYPE_GROUPS, PROPERTY_TYPE_LABELS } from "@/lib/format";

/**
 * The `<option>` list for a property-type `<select>`, grouped.
 *
 * Shared so the four places a buyer meets this list — hero search, the listing
 * filters, the shared filter bar and the valuation form — cannot drift apart
 * on which types exist or what they are called.
 */
export default function PropertyTypeOptions() {
  return (
    <>
      {PROPERTY_TYPE_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.types.map((type) => (
            <option key={type} value={type}>
              {PROPERTY_TYPE_LABELS[type] ?? type}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
