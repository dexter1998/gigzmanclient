/**
 * A plain Google Maps `output=embed` iframe — no API key, no billing, no JS
 * SDK. This is deliberately not the same thing as `MapSelectedPropertyV2`'s
 * marker/list-sync shell (which is waiting on the real Maps JS API for
 * clustering); this is just "show where the office actually is," which the
 * free embed endpoint already does today.
 */
export default function MapEmbedV2({
  address,
  coordinates,
  className = "aspect-[16/10] w-full",
  eager = false,
}: {
  address: string;
  /**
   * `"lat,lng"` from the client's own listing. Preferred over `address` when
   * present, because the embed geocodes whatever string it is given and a
   * shop address without a house number lands wherever Google thinks is
   * closest — High Properties' pin sat about five kilometres north of the
   * office until this was passed. The address is still used for the title.
   */
  coordinates?: string | null;
  className?: string;
  /** Google's tiles take a couple of seconds to paint — set this when the
   * map sits at or near the fold (e.g. the FAQ page's aside), so it isn't
   * still lazy-loading (and reading as "blank") by the time it's seen.
   * Leave lazy (default) for anything genuinely below the fold, like the
   * footer's copy. */
  eager?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)] ${className}`}
    >
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(coordinates || address)}&output=embed`}
        title={`Map: ${address}`}
        loading={eager ? "eager" : "lazy"}
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}
