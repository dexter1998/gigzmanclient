import { placeIdFor } from "@/lib/premium-v2/places";

/**
 * The office location map.
 *
 * Two endpoints, picked by whether a Maps Embed API key is configured:
 *
 *  - With a key, `embed/v1/place` renders Google's own profile card — name,
 *    address, rating, and directions — which is the thing that makes a
 *    visitor trust they are looking at the right business.
 *  - Without one, the free `output=embed` endpoint still draws a labelled pin
 *    when queried by business name. It does NOT accept `place_id:` or
 *    `ftid:`; both were tried and both render a zoomed-out world map, so the
 *    Place ID is only useful on the keyed path.
 *
 * Deliberately NOT the Locator Plus snippet the Cloud console exports: that
 * pulls a few hundred kilobytes of web-component JavaScript from
 * ajax.googleapis.com to render a multi-location store finder, and these
 * clients have exactly one location each. Place mode renders the same card in
 * a single iframe.
 *
 * The key is a browser key — it is visible in the page by design — so it MUST
 * carry an HTTP-referrer restriction in the Google Cloud console, or anyone
 * can bill Maps requests to the project.
 */
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

export default function MapEmbedV2({
  address,
  businessName,
  tenantSlug,
  coordinates,
  className = "aspect-[16/10] w-full",
  eager = false,
}: {
  address: string;
  /**
   * Searching by name is what makes Google draw the listing's own labelled
   * pin instead of an anonymous red marker, on both endpoints.
   */
  businessName?: string | null;
  /** Resolves this client's Place ID, the most precise query available. */
  tenantSlug?: string | null;
  /**
   * `"lat,lng"` from the client's own listing — the last resort, and still
   * better than the address alone: the embed geocodes whatever string it is
   * given, and a shop address without a house number lands wherever Google
   * thinks is closest. High Properties' pin sat about five kilometres north
   * of the office until this was passed.
   */
  coordinates?: string | null;
  className?: string;
  /** Google's tiles take a couple of seconds to paint — set this when the
   * map sits at or near the fold (e.g. the FAQ page's aside), so it isn't
   * still lazy-loading (and reading as "blank") by the time it's seen. */
  eager?: boolean;
}) {
  const placeId = tenantSlug ? placeIdFor(tenantSlug) : null;
  const named = businessName ? `${businessName}, ${address}` : null;
  const query = named ?? coordinates ?? address;

  const src = KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${encodeURIComponent(
        placeId ? `place_id:${placeId}` : query,
      )}&zoom=17`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;

  return (
    <div
      className={`overflow-hidden rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)] ${className}`}
    >
      <iframe
        src={src}
        title={`Map: ${businessName ? `${businessName}, ` : ""}${address}`}
        loading={eager ? "eager" : "lazy"}
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}
