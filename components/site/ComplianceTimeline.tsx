import Link from "next/link";
import { formatDate, daysUntil } from "@/lib/format";
import Illustration from "./Illustration";

interface TimelineEvent {
  id: string;
  title: string;
  dueDate: string;
  extendedDueDate: string | null;
}

interface ComplianceTimelineProps {
  events: TimelineEvent[];
  calendarHref: string;
}

/**
 * Horizontal strip of the next statutory dates with a live day count.
 *
 * Peer practices that publish a calendar almost always let it go stale; this one
 * is generated from the same records the dashboard edits, so it cannot drift.
 */
export default function ComplianceTimeline({ events, calendarHref }: ComplianceTimelineProps) {
  if (events.length === 0) return null;

  const shown = events.slice(0, 4);

  return (
    <div className="rounded-[14px] bg-tint-deep px-5 py-6 sm:px-7 sm:py-7">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center lg:gap-10">
        <div className="flex items-start gap-3.5">
          <Illustration
            name="calendar-clock"
            sizes="120px"
            className="h-auto w-[86px] shrink-0 sm:w-[104px]"
          />
          <div>
            <p className="display-sm">Never Miss a Compliance</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              Stay updated with important due dates and filing deadlines.
            </p>
            <Link
              href={calendarHref}
              className="mt-3.5 inline-flex min-h-[38px] items-center rounded-[8px] border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-navy hover:border-navy"
            >
              View Compliance Calendar
            </Link>
          </div>
        </div>

        {/* The connecting rule sits behind the markers on wide screens only. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[26px] hidden h-px bg-line-strong sm:block"
          />
          <ul className="relative grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {shown.map((event) => {
              const effective = event.extendedDueDate ?? event.dueDate;
              const days = daysUntil(effective);
              const [dayNum, monthLabel] = formatDate(effective).split(" ");

              return (
                <li key={event.id} className="flex flex-col items-center text-center">
                  <span
                    aria-hidden="true"
                    className="mb-2 hidden h-2 w-2 rounded-full bg-accent ring-4 ring-tint-deep sm:block"
                  />
                  <span className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-[10px] bg-surface">
                    <span className="font-display text-[19px] font-medium leading-none text-navy">
                      {dayNum}
                    </span>
                    <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                      {monthLabel}
                    </span>
                  </span>
                  <span className="mt-2.5 line-clamp-2 text-[12px] font-medium leading-snug text-ink">
                    {event.title}
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-accent">
                    {days <= 0 ? "Due today" : `Due in ${days} day${days === 1 ? "" : "s"}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
