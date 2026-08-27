import {
  FileText,
  TrendingUp,
  Receipt,
  FileSearch,
  MailWarning,
  BadgeCheck,
  FileSpreadsheet,
  Lightbulb,
  Scale,
  TriangleAlert,
  ShieldCheck,
  SearchCheck,
  ListChecks,
  BarChart3,
  Building2,
  Handshake,
  Landmark,
  BookOpen,
  Wallet,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

/**
 * One icon per service, keyed by slug. A service without an entry falls back to
 * its category icon, so adding a service never leaves a blank tile.
 */
const BY_SLUG: Record<string, LucideIcon> = {
  // Taxation
  "income-tax-return": FileText,
  "tax-planning-advisory": TrendingUp,
  "tds-compliance": Receipt,
  "tax-audit": FileSearch,
  "income-tax-notice-assistance": MailWarning,

  // GST
  "gst-registration": BadgeCheck,
  "gst-return-filing": FileSpreadsheet,
  "gst-advisory": Lightbulb,
  "gst-reconciliation": Scale,
  "gst-notice-assistance": TriangleAlert,

  // Audit and assurance
  "statutory-audit": ShieldCheck,
  "internal-audit": SearchCheck,
  "compliance-review": ListChecks,
  "financial-statement-review": BarChart3,

  // Business and corporate
  "company-incorporation": Building2,
  "llp-registration": Handshake,
  "roc-compliance": Landmark,
  "accounting-bookkeeping": BookOpen,
  "payroll-compliance": Wallet,
  "business-advisory": Briefcase,
};

const BY_CATEGORY: Record<string, LucideIcon> = {
  taxation: Receipt,
  gst: FileSpreadsheet,
  audit_assurance: ShieldCheck,
  business_corporate: Building2,
};

export function serviceIcon(slug: string, category: string): LucideIcon {
  return BY_SLUG[slug] ?? BY_CATEGORY[category] ?? FileText;
}

interface ServiceIconProps {
  slug: string;
  category: string;
  className?: string;
  /** Renders the icon inside a tinted tile rather than bare. */
  boxed?: boolean;
  boxClassName?: string;
}

export default function ServiceIcon({
  slug,
  category,
  className = "h-[18px] w-[18px]",
  boxed,
  boxClassName = "h-10 w-10 rounded-[9px] bg-tint",
}: ServiceIconProps) {
  const Icon = serviceIcon(slug, category);

  if (!boxed) return <Icon className={`${className} text-accent`} aria-hidden="true" />;

  return (
    <span className={`flex shrink-0 items-center justify-center ${boxClassName}`}>
      <Icon className={`${className} text-accent`} aria-hidden="true" />
    </span>
  );
}
