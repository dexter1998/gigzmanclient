import type { LucideIcon } from "lucide-react";

export interface MarketStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface MarketStatRowProps {
  stats: MarketStat[];
  className?: string;
}

/** Compact KPI strip used on locality pages and property detail sidebars. */
export default function MarketStatRow({ stats, className = "" }: MarketStatRowProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-[10px] border border-line bg-surface p-3.5">
            <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="mt-2 font-display text-[16px] font-medium text-ink">{stat.value}</p>
            <p className="mt-0.5 text-[11px] text-ink-subtle">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
