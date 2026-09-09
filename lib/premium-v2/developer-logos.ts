/**
 * Developer name -> logo file.
 *
 * The register pages list every promoter that appears in the HRERA filings,
 * which is far more names than there are logo files, so this is a lookup with
 * a miss being normal — callers fall back to a monogram. Matching is done on
 * a squashed form of the name because the filings spell the same promoter
 * several ways ("DLF Limited", "DLF Home Developers Ltd").
 */
const BASE = "/verticals/realestate/templates/premium-v2/developer-logos-v2";

export interface DeveloperLogo {
  src: string;
  /** Sourced white-on-transparent, so it needs inverting on light ground. */
  invert?: boolean;
}

/** Keys are lowercase, alphanumeric-only; matched as a prefix of the name. */
const LOGOS: Record<string, DeveloperLogo> = {
  dlf: { src: `${BASE}/dlf.svg` },
  emaar: { src: `${BASE}/emaar.svg` },
  m3m: { src: `${BASE}/m3m.webp`, invert: true },
  conscient: { src: `${BASE}/conscient.png` },
  ats: { src: `${BASE}/ats.svg` },
  godrej: { src: `${BASE}/godrej.svg` },
  herohomes: { src: `${BASE}/hero-homes.jpg` },
  hero: { src: `${BASE}/hero-homes.jpg` },
};

function squash(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function developerLogo(name: string): DeveloperLogo | undefined {
  const key = squash(name);
  if (LOGOS[key]) return LOGOS[key];
  // Longest key first, so "herohomes" is preferred over "hero".
  const match = Object.keys(LOGOS)
    .sort((a, b) => b.length - a.length)
    .find((k) => key.startsWith(k));
  return match ? LOGOS[match] : undefined;
}

/** Initials for a promoter with no logo file — up to two words. */
export function developerMonogram(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
