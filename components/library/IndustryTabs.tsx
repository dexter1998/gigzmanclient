import Link from "next/link";
import { VERTICAL_IDS, getVerticalConfig, type VerticalId } from "@/lib/verticals";

interface IndustryTabsProps {
  /** `null` renders the "All" tab active — the root library page. */
  active: VerticalId | null;
}

/**
 * Plain links, not client-side filtering — each industry is a real,
 * shareable URL (`/{vertical}`), not just a filter state on the root page.
 */
export default function IndustryTabs({ active }: IndustryTabsProps) {
  const TAB = "inline-flex min-h-[38px] items-center rounded-full px-4 text-[13px] font-medium transition-colors";
  const ACTIVE = "bg-navy text-white";
  const INACTIVE = "border border-line-strong text-ink-muted hover:border-navy hover:text-navy";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/" className={`${TAB} ${active === null ? ACTIVE : INACTIVE}`}>
        All Industries
      </Link>
      {VERTICAL_IDS.map((id) => (
        <Link key={id} href={`/${id}`} className={`${TAB} ${active === id ? ACTIVE : INACTIVE}`}>
          {getVerticalConfig(id).label}
        </Link>
      ))}
    </div>
  );
}
