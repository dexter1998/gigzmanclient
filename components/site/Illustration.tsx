import Image from "next/image";

/**
 * Registry of the supplied 3D artwork.
 *
 * Intrinsic dimensions are recorded so `next/image` can reserve space and serve
 * optimised WebP variants; the PNG sources stay untouched. To swap an asset,
 * replace the file in `public/3d/` and update its size here.
 */
const ASSETS = {
  dashboard: { src: "/3d/dashboard.png", width: 1100, height: 733 },
  "calendar-clock": { src: "/3d/calendar-clock.png", width: 900, height: 600 },
  "growth-orange": { src: "/3d/growth-orange.png", width: 900, height: 600 },
  "growth-blue": { src: "/3d/growth-blue.png", width: 900, height: 600 },
  podium: { src: "/3d/podium.png", width: 900, height: 600 },
  "calculator-rupee": { src: "/3d/calculator-rupee.png", width: 800, height: 734 },
  "documents-shield": { src: "/3d/documents-shield.png", width: 800, height: 731 },
  "percent-tray": { src: "/3d/percent-tray.png", width: 800, height: 800 },
  "checklist-search": { src: "/3d/checklist-search.png", width: 800, height: 800 },
} as const;

export type IllustrationName = keyof typeof ASSETS;

interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  /** Only the hero illustration should load eagerly. */
  priority?: boolean;
  sizes?: string;
}

export default function Illustration({
  name,
  className = "",
  priority,
  sizes = "(max-width: 768px) 80vw, 420px",
}: IllustrationProps) {
  const asset = ASSETS[name];

  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      priority={priority}
      // Decorative throughout — the surrounding heading carries the meaning, so
      // announcing the artwork would only add noise for screen readers.
      alt=""
      aria-hidden="true"
      className={`select-none object-contain ${className}`}
    />
  );
}
