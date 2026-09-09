import Image from "next/image";
import { cn } from "./gp-primitives";

/**
 * Decorative gold line-art that fills the empty half of a forest-green band.
 *
 * The template's page headers and calculator panels are single-column: copy
 * on the left, nothing on the right, which reads as an unfinished block at
 * desktop widths. These are the client-supplied blueprint artworks, drawn as
 * flat gold line work on transparency so they sit on the forest ground
 * without needing a scrim.
 *
 * Decorative only — `alt=""` and `aria-hidden`, never announced. Placement is
 * always `absolute inset-0`, so every caller must be `relative
 * overflow-hidden` and must render its own content above this at `z-[1]`.
 */
const BASE = "/verticals/realestate/templates/premium-v2/backgrounds";

const SOURCES = {
  /** Single tower cluster growing out of the right edge — page headers. */
  "building-right": `${BASE}/building-lines-right.webp`,
  /** Its mirror, for a band whose copy sits on the right. */
  "building-left": `${BASE}/building-lines-left.webp`,
  /** Towers at both edges, empty through the middle — full-width sections. */
  "blueprint-wide": `${BASE}/building-blueprint-wide.webp`,
  /** Survey contours and road traces — locality and vastu bands. */
  "contours-wide": `${BASE}/locality-contours-wide.webp`,
  /** Art-deco arch framing the top of a band. */
  "art-deco-wide": `${BASE}/art-deco-frame-wide.webp`,
} as const;

export type LineArtVariant = keyof typeof SOURCES;

/** Corner artworks are square and anchored to their own edge; the wide ones bleed across. */
const FIT: Record<LineArtVariant, string> = {
  "building-right": "object-contain object-right-bottom",
  "building-left": "object-contain object-left-bottom",
  "blueprint-wide": "object-cover object-bottom",
  // Abstract contour lines, so a little vertical stretch is invisible —
  // and unlike `cover` it keeps the left and right edges (where all the
  // line work is) inside the frame at any section height.
  "contours-wide": "object-fill",
  "art-deco-wide": "object-cover object-top",
};

/**
 * The wide artworks carry their line work at the left and right edges and are
 * empty through the middle. `object-cover` in a section taller than the
 * artwork's 16:9 scales to the height and crops both edges away — exactly the
 * parts worth showing — so the skyline is capped in height instead.
 *
 * That cap is anchored to the BOTTOM, not the top: a skyline capped from the
 * top ends mid-section, leaving the buildings floating above a bare strip of
 * green. Anchored to the bottom they stand on the section's own edge and the
 * empty green above them reads as sky. Corner artwork stays full-height: it
 * is anchored, not bled.
 */
const FRAME: Record<LineArtVariant, string> = {
  "building-right": "inset-0",
  "building-left": "inset-0",
  "blueprint-wide": "inset-x-0 bottom-0 h-full max-h-[680px]",
  "contours-wide": "inset-0",
  "art-deco-wide": "inset-x-0 top-0 h-full max-h-[680px]",
};

export default function LineArtBackdropV2({
  variant,
  className,
  opacity = 0.9,
  /** Corner artwork crowds the copy on a phone; the wide ones stay on. */
  desktopOnly = false,
}: {
  variant: LineArtVariant;
  className?: string;
  opacity?: number;
  desktopOnly?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute select-none",
        FRAME[variant],
        desktopOnly && "hidden md:block",
        className,
      )}
      style={{ opacity }}
    >
      <Image
        src={SOURCES[variant]}
        alt=""
        fill
        // Decorative: never the LCP element, and never worth blocking on.
        loading="lazy"
        sizes="100vw"
        className={FIT[variant]}
      />
    </div>
  );
}
