/**
 * A plain Google Maps `output=embed` iframe — no API key, no billing, no JS
 * SDK. This is deliberately not the same thing as `MapSelectedPropertyV2`'s
 * marker/list-sync shell (which is waiting on the real Maps JS API for
 * clustering); this is just "show where the office actually is," which the
 * free embed endpoint already does today.
 *
 * Deliberately NOT the Locator Plus snippet Google's Quick Builder exports:
 * that pulls a few hundred kilobytes of web-component JavaScript from
 * ajax.googleapis.com to render a multi-location store finder, and these
 * clients have exactly one location each.
 *
 * The keyless endpoint does NOT accept `place_id:` or `ftid:` — both were
 * tried and both render a zoomed-out world map. Showing the business by name
 * is what puts its label on the pin; the full Google profile card needs the
 * paid Maps Embed API (`embed/v1/place?key=…`), which nothing here has a key
 * for.
 */
export default function MapEmbedV2({
  address,
  businessName,
  coordinates,
  className = "aspect-[16/10] w-full",
  eager = false,
}: {
  address: string;
  /**
   * When set, the map is queried by name and address, which is what makes
   * Google draw the listing's own labelled pin ("High Properties") instead of
   * an anonymous red marker. Falls back to coordinates when absent.
   */
  businessName?: string | null;
  /**
   * `"lat,lng"` from the client's own listing. Used when there is no business
   * name to search by, and preferred over `address` alone: the embed geocodes
   * whatever string it is given, and a shop address without a house number
   * lands wherever Google thinks is closest — High Properties' pin sat about
   * five kilometres north of the office until this was passed.
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
  const query = businessName ? `${businessName}, ${address}` : coordinates || address;

  return (
    <div
      className={`overflow-hidden rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)] ${className}`}
    >
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`}
        title={`Map: ${businessName ? `${businessName}, ` : ""}${address}`}
        loading={eager ? "eager" : "lazy"}
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}
