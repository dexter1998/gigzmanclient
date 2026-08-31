import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { formatIndianPrice } from "@/lib/format";
import type { localities } from "@/lib/db/schema";

interface LocalityCardProps {
  locality: typeof localities.$inferSelect;
  href: string;
}

export default function LocalityCard({ locality, href }: LocalityCardProps) {
  const yoy = locality.yoyChangePercent;
  const positive = yoy !== null && yoy >= 0;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-ring hover:shadow-[0_2px_6px_rgba(15,44,82,0.06),0_20px_44px_-20px_rgba(15,44,82,0.24)]"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-tint">
        {locality.heroImage ? (
          <Image
            src={locality.heroImage}
            alt={locality.name}
            fill
            sizes="(max-width: 768px) 92vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-8 w-8 text-accent" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-3">
          <p className="text-[13px] font-medium leading-snug text-white">{locality.name}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          {locality.avgPricePerSqft ? (
            <div>
              <p className="text-[11px] text-ink-subtle">Avg. price</p>
              <p className="font-display text-[15px] font-medium text-ink">
                {formatIndianPrice(locality.avgPricePerSqft)}/sq.ft
              </p>
            </div>
          ) : (
            <span />
          )}

          {yoy !== null ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                positive ? "bg-status-success-soft text-status-success" : "bg-status-danger-soft text-status-danger"
              }`}
            >
              {positive ? (
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
              )}
              {Math.abs(yoy)}% YoY
            </span>
          ) : null}
        </div>

        {locality.bestFor ? (
          <p className="mt-2.5 text-[12px] text-ink-muted">Best for: {locality.bestFor}</p>
        ) : null}
      </div>
    </Link>
  );
}
