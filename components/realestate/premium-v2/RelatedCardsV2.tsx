import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./gp-primitives";

export interface RelatedCardItem {
  href: string;
  /** Card heading — the destination, named the way the visitor would say it. */
  title: string;
  /** One short line saying what is on the other side of the link. */
  subtitle?: string;
  icon?: LucideIcon;
}

/**
 * The template's standard "related pages" block.
 *
 * These interlinks used to render as rounded pill badges — a wall of same-size
 * capsules with nothing but a name on them, which gave the visitor no reason
 * to prefer one over another and read as tag chrome rather than navigation.
 * Every faceted set (other conversions, nearby sectors, other directions,
 * other corridors) now uses this one card shape instead: icon, heading,
 * supporting line.
 */
export default function RelatedCardsV2({
  title,
  intro,
  items,
  icon: defaultIcon,
  columns = 4,
  className,
  headingLevel: Heading = "h2",
}: {
  title?: string;
  intro?: string;
  items: RelatedCardItem[];
  /** Fallback icon for items that do not carry their own. */
  icon?: LucideIcon;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  if (items.length === 0) return null;

  const cols =
    columns === 1
      ? ""
      : columns === 2
        ? "sm:grid-cols-2"
        : columns === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={className}>
      {title ? (
        <Heading className="font-display text-[16px] text-[color:var(--gp-ink)]">{title}</Heading>
      ) : null}
      {intro ? (
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
          {intro}
        </p>
      ) : null}

      <div className={cn("mt-5 grid grid-cols-1 gap-4", cols)}>
        {items.map((item) => {
          const Icon = item.icon ?? defaultIcon;
          return (
            <Link
              key={item.href + item.title}
              href={item.href}
              className="group flex items-start gap-3.5 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-4 transition-colors hover:border-[color:var(--gp-gold-600)]"
            >
              {Icon ? (
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--gp-cream-200)] text-[color:var(--gp-gold-600)] transition-colors group-hover:bg-[color:var(--gp-gold-600)] group-hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : null}

              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-semibold leading-snug text-[color:var(--gp-ink)]">
                    {item.title}
                  </span>
                  <ArrowUpRight
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--gp-muted)] transition-colors group-hover:text-[color:var(--gp-gold-600)]"
                    aria-hidden="true"
                  />
                </span>
                {item.subtitle ? (
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-[color:var(--gp-muted)]">
                    {item.subtitle}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
