/**
 * Google Place IDs, per client.
 *
 * Kept in code rather than in `firm_settings` on purpose. A column would be
 * the tidier home, but it would also mean a schema change that production has
 * to be migrated for before the next deploy — and a deploy that references a
 * column production does not have fails at BUILD time, taking the whole site
 * with it. This is a handful of stable identifiers for a handful of clients,
 * and the codebase already carries per-client switches this way
 * (`vastuSectorsEnabled`, `homeLoanEnabled`, `serviceLinesFor`).
 *
 * Only used when `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` is set: the keyless embed
 * endpoint ignores `place_id:` entirely and renders a world map.
 */
const PLACE_IDS: Record<string, string> = {
  // Shop on Main Road, Dwarka Expressway, near Assotech The Blinth, Sector 99.
  "high-properties": "ChIJD1UYJ20XDTkRPiGtfZOM4Y8",
  // Office at The Westin Sohna Resort & Spa, Karnki — the same listing
  // clients/evergreen-real-estate/profile.yaml's NAP was read from.
  "evergreen-real-estate": "ChIJozjps20pDTkRbunfm45O_-k",
};

export function placeIdFor(slug: string): string | null {
  return PLACE_IDS[slug] ?? null;
}

/**
 * Which tenants render the full Locator Plus map rather than the place embed.
 *
 * Empty, and that is the current answer rather than an oversight.
 *
 * Locator Plus works — it is wired up in StoreLocatorV2 and renders the
 * client's own listing — but it calls the Maps JavaScript and Places APIs,
 * and those need billing enabled on the Cloud project. Without it Google
 * paints "For development purposes only" across the tiles and an error card
 * over them, which looks broken to a visitor.
 *
 * The keyless iframe embed needs no key and no billing, draws an exact pin
 * from the listing's own coordinates, and is the whole of what a one-office
 * client needs. So it stays until someone turns billing on; then add the slug
 * here and the contact page switches over.
 */
const LOCATOR_TENANTS = new Set<string>([]);

export function locatorEnabledFor(slug: string | undefined | null): boolean {
  if (!slug) return false;
  if (!LOCATOR_TENANTS.has(slug)) return false;
  // Checked here rather than in the component: the component is a Client
  // Component, and a function exported from one cannot be called on the
  // server. `NEXT_PUBLIC_*` is readable on both sides, so the gate belongs in
  // this module, which either side can import.
  return Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY,
  );
}
