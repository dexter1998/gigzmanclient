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
};

export function placeIdFor(slug: string): string | null {
  return PLACE_IDS[slug] ?? null;
}
