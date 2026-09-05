import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { properties } from "@/lib/db/schema";
import { formatIndianPrice, formatNumber, PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/format";

type Property = typeof properties.$inferSelect;
type CardSize = "default" | "large" | "tall";

/**
 * Aspect ratio governs the "default" card (used in equal 4-up grids). "large"
 * and "tall" are sized by their parent CSS grid in HotPropertiesGridV2 (which
 * row-spans them against two stacked default cards) — an explicit aspect
 * ratio there would fight the grid's stretch sizing, so on large screens
 * those two sizes fill the grid cell (`lg:h-full`) and only fall back to a
 * fixed aspect on mobile, where the asymmetric grid collapses to one column.
 */
const SIZE_CLASSES: Record<CardSize, string> = {
  default: "aspect-[4/3]",
  large: "aspect-[16/11] lg:aspect-auto lg:h-full",
  tall: "aspect-[3/4] lg:aspect-auto lg:h-full",
};

const IMAGE_SIZES: Record<CardSize, string> = {
  default: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  large: "(max-width: 1024px) 100vw, 50vw",
  tall: "(max-width: 1024px) 100vw, 25vw",
};

/** Gold reads as "the standout pick"; white reads as a routine status tag. */
function pillTone(badge: string | null) {
  if (badge && badge.toLowerCase().includes("flagship")) {
    return "bg-[color:var(--gp-gold-600)] text-[color:var(--gp-forest-950)]";
  }
  if (badge) return "bg-white/92 text-[color:var(--gp-ink)]";
  return "bg-white/15 text-white backdrop-blur-sm";
}

function configLine(property: Property): string {
  const area = property.area ? `${formatNumber(property.area)} ${property.areaUnit ?? "sqft"}` : null;
  if (property.beds) {
    const bhk = `${property.beds} BHK`;
    return area ? `${bhk} · ${area}` : bhk;
  }
  const typeLabel = PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType;
  return area ? `${typeLabel} · ${area}` : typeLabel;
}

export default function PropertyCardV2({
  property,
  href,
  imagePath,
  imageAlt,
  size = "default",
}: {
  property: Property;
  href: string;
  imagePath?: string | null;
  imageAlt?: string;
  size?: CardSize;
}) {
  const pillLabel = property.badge ?? PROPERTY_STATUS_LABELS[property.status];
  const priceDisplay = property.priceLabel ?? (property.price ? formatIndianPrice(property.price) : "Price on request");
  const locationLine = [property.locality, property.sector ? `Sector ${property.sector}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={href}
      className={`group relative block w-full overflow-hidden rounded-[var(--gp-radius-md)] ${SIZE_CLASSES[size]}`}
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt={imageAlt ?? property.title}
          fill
          sizes={IMAGE_SIZES[size]}
          className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-[color:var(--gp-forest-800)]" />
      )}

      {/* Bottom-of-image text scrim — the only card treatment; no white body. */}
      <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />

      <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
        <span className={`rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] ${pillTone(property.badge)}`}>
          {pillLabel}
        </span>
      </div>

      <span className="absolute right-4 top-4 flex translate-y-1 items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[color:var(--gp-ink)] opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:right-5 sm:top-5">
        View Property
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {locationLine ? (
          <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{locationLine}</p>
        ) : null}
        <h3 className="gp-overlay-title font-display mt-1 text-white">{property.title}</h3>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-[12.5px] font-medium text-white/85 sm:text-[13px]">{configLine(property)}</p>
          <p className="whitespace-nowrap text-[15px] font-semibold text-[color:var(--gp-gold-300)] sm:text-[17px]">
            {priceDisplay}
          </p>
        </div>
      </div>
    </Link>
  );
}
