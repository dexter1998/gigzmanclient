import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Ruler, MapPin, ShieldCheck, ShieldAlert } from "lucide-react";
import Badge from "@/components/ui/Badge";
import PropertyTypeIcon from "./PropertyTypeIcon";
import { formatIndianPrice, PROPERTY_STATUS_LABELS } from "@/lib/format";
import type { properties } from "@/lib/db/schema";

interface PropertyCardProps {
  property: typeof properties.$inferSelect;
  href: string;
  imagePath?: string | null;
  imageAlt?: string;
}

/**
 * RERA disclosure is not an optional detail here — the Real Estate (Regulation
 * and Development) Act requires an advertisement for a registered project to
 * carry its registration number. A listing without one shows that plainly
 * rather than silently omitting the line, the same way a CA-vertical
 * calculator with unverified rates shows a review banner instead of hiding it.
 */
export default function PropertyCard({ property, href, imagePath, imageAlt }: PropertyCardProps) {
  const priceDisplay = property.priceLabel || (property.price ? formatIndianPrice(property.price) : null);
  const locationLine = [property.locality, property.sector ? `Sector ${property.sector}` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-ring hover:shadow-[0_2px_6px_rgba(15,44,82,0.06),0_20px_44px_-20px_rgba(15,44,82,0.24)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-tint">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={imageAlt ?? property.title}
            fill
            sizes="(max-width: 768px) 92vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PropertyTypeIcon propertyType={property.propertyType} className="h-8 w-8" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone="accent">{PROPERTY_STATUS_LABELS[property.status] ?? property.status}</Badge>
          {property.badge ? <Badge tone="info">{property.badge}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-semibold leading-snug text-ink">{property.title}</p>
        </div>

        {locationLine ? (
          <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink-muted">
            <MapPin className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
            {locationLine}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
          {property.beds ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
              {property.beds} BHK
            </span>
          ) : null}
          {property.baths ? (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" aria-hidden="true" />
              {property.baths}
            </span>
          ) : null}
          {property.area ? (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
              {property.area} {property.areaUnit}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-line pt-3">
          <p className="font-display text-[16px] font-medium text-accent">
            {priceDisplay ?? "Price on request"}
          </p>

          {property.reraNumber ? (
            <span
              className="flex items-center gap-1 text-[10px] text-status-success"
              title={`RERA ${property.reraNumber}`}
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              RERA verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-status-warn">
              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
              Registration pending
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
