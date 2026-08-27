import {
  Rocket,
  ShoppingCart,
  Factory,
  Building2,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { INDUSTRIES } from "@/lib/industries";

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  ShoppingCart,
  Factory,
  Building2,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Cpu,
};

interface IndustriesGridProps {
  /** Highlighted entry, used on pages scoped to one sector. */
  activeSlug?: string;
}

export default function IndustriesGrid({ activeSlug }: IndustriesGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-8">
      {INDUSTRIES.map((industry) => {
        const Icon = ICONS[industry.icon] ?? Briefcase;
        const active = industry.slug === activeSlug;
        return (
          <li key={industry.slug} className="flex flex-col items-center text-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                active ? "bg-accent-soft" : "bg-tint"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${active ? "text-accent" : "text-navy"}`}
                aria-hidden="true"
              />
            </span>
            <span
              className={`mt-2.5 text-[12px] font-medium leading-snug ${
                active ? "text-accent" : "text-ink"
              }`}
            >
              {industry.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
