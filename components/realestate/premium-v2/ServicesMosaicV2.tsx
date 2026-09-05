import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Home, Tag, Key, TrendingUp, Trees, Store, MapPin, Building, Landmark } from "lucide-react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

interface ServicesMosaicV2Props {
  p: (path: string) => string;
}

const BASE = "/verticals/realestate/templates/premium-v2/images";

interface ServiceTile {
  icon: LucideIcon;
  label: string;
  src: string;
  alt: string;
  href: string;
}

// One flat 3x3 grid — the 4 transaction types and the 5 property types both
// resolve to the same /properties search, so they read as one consistent
// "how can we help" set rather than a primary/secondary split.
const SERVICES: ServiceTile[] = [
  { icon: Home, label: "Buy", src: `${BASE}/hero-curated-inventory.png`, alt: "Curated residential inventory", href: "/properties?purpose=buy" },
  { icon: Tag, label: "Sell", src: `${BASE}/personalised-recommendation.png`, alt: "Advisor presenting a sale recommendation", href: "/contact?intent=sell" },
  { icon: Key, label: "Lease", src: `${BASE}/hero-luxury-advisory.png`, alt: "Advisors discussing a leasing plan", href: "/properties?purpose=rent" },
  { icon: TrendingUp, label: "Invest", src: `${BASE}/hero-market-intelligence.png`, alt: "Gurugram skyline at night", href: "/properties?type=commercial" },
  { icon: Trees, label: "Villas", src: `${BASE}/project-lowrise-villas.png`, alt: "Villa community", href: "/properties?type=villa" },
  { icon: Store, label: "Shops", src: `${BASE}/project-commercial-retail.png`, alt: "Retail shops", href: "/properties?type=sco" },
  { icon: MapPin, label: "Plots", src: `${BASE}/corridor-southern-peripheral-road.png`, alt: "Open plots along a corridor", href: "/properties?type=plot" },
  { icon: Building, label: "Builder Floors", src: `${BASE}/project-family-residential.png`, alt: "Builder floor residential project", href: "/properties?type=builder_floor" },
  { icon: Landmark, label: "Commercial", src: `${BASE}/due-diligence.webp`, alt: "Commercial due-diligence review", href: "/properties?type=commercial" },
];

export default function ServicesMosaicV2({ p }: ServicesMosaicV2Props) {
  return (
    <GpSection tone="forest">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow>Services</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-white">
              Expert help across every real-estate decision
            </h2>
            <p className="mt-2 max-w-md text-[14px] text-white/65">
              Clear advice, verified inventory and local execution.
            </p>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.label}
                href={p(service.href)}
                className="group relative aspect-square overflow-hidden rounded-[var(--gp-radius-md)] sm:aspect-[4/3]"
              >
                <Image
                  src={service.src}
                  alt={service.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-4 sm:p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--gp-gold-600)]">
                    <Icon className="h-4 w-4 text-[color:var(--gp-forest-950)]" aria-hidden="true" />
                  </span>
                  <p className="gp-overlay-title font-display text-white">{service.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </GpContainer>
    </GpSection>
  );
}
