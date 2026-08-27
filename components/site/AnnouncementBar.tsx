import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { deadlineInstant, formatDate } from "@/lib/format";

interface AnnouncementBarProps {
  title: string;
  dueDate: string;
  extendedDueDate?: string | null;
  href: string;
}

/**
 * Surfaces the nearest upcoming statutory deadline site-wide. The effective date
 * is the extension where one exists, but the original date still drives the label
 * so a reader can see that it moved.
 */
export default function AnnouncementBar({
  title,
  dueDate,
  extendedDueDate,
  href,
}: AnnouncementBarProps) {
  const effectiveDate = extendedDueDate ?? dueDate;

  return (
    <div className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-2 sm:items-center">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden="true" />
          <p className="text-[13px] leading-snug">
            <span className="font-semibold">{title}</span>
            <span className="mx-1.5 hidden opacity-60 sm:inline">·</span>
            <span className="block opacity-90 sm:inline">
              due {formatDate(effectiveDate)}
              {extendedDueDate ? " (extended)" : ""}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          <span className="rounded-full bg-accent px-2.5 py-1">
            <CountdownTimer targetIso={deadlineInstant(effectiveDate).toISOString()} compact />
          </span>
          <Link
            href={href}
            className="inline-flex min-h-[32px] items-center gap-1 py-1 text-[13px] font-medium underline underline-offset-2 hover:opacity-80"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
