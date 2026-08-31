import { Building2, LandPlot, Home, Store, Warehouse, type LucideIcon } from "lucide-react";

/**
 * One icon per property type, matching how the CA vertical's ServiceIcon maps
 * a slug to a mark. Original work — not sourced from any downloaded kit.
 */
const ICONS: Record<string, LucideIcon> = {
  apartment: Building2,
  builder_floor: Home,
  plot: LandPlot,
  villa: Home,
  sco: Store,
  commercial: Warehouse,
};

interface PropertyTypeIconProps {
  propertyType: string;
  className?: string;
  boxed?: boolean;
  boxClassName?: string;
}

export default function PropertyTypeIcon({
  propertyType,
  className = "h-[18px] w-[18px]",
  boxed,
  boxClassName = "h-10 w-10 rounded-[9px] bg-tint",
}: PropertyTypeIconProps) {
  const Icon = ICONS[propertyType] ?? Building2;

  if (!boxed) return <Icon className={`${className} text-accent`} aria-hidden="true" />;

  return (
    <span className={`flex shrink-0 items-center justify-center ${boxClassName}`}>
      <Icon className={`${className} text-accent`} aria-hidden="true" />
    </span>
  );
}
