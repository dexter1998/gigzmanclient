import { notFound } from "next/navigation";
import { ExternalLink, AlertTriangle } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import CountdownTimer from "@/components/site/CountdownTimer";
import Illustration from "@/components/site/Illustration";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings, getUpcomingCompliance, getPastCompliance } from "@/lib/content";
import { formatDate, deadlineInstant, daysUntil } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/site/[tenant]/compliance-calendar">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    alternates: { canonical: joinPath(basePathFor(tenant), "/compliance-calendar") },
    title: `Compliance Calendar — ${settings?.firmName ?? ""}`,
    description:
      "Upcoming statutory filing and compliance dates. Confirm applicability to your circumstances before filing.",
  };
}

function urgencyTone(days: number) {
  if (days <= 3) return "danger" as const;
  if (days <= 10) return "warn" as const;
  return "neutral" as const;
}

export default async function ComplianceCalendarPage(props: PageProps<"/site/[tenant]/compliance-calendar">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [upcoming, past] = await Promise.all([
    getUpcomingCompliance(tenant.id),
    getPastCompliance(tenant.id),
  ]);

  const unverifiedCount = upcoming.filter((e) => !e.lastVerifiedAt).length;

  return (
    <>
      <Section tone="tint" size="md">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
          <a href={p("/")} className="inline-block py-1 hover:text-navy">
            Home
          </a>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">Compliance Calendar</span>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeader
            eyebrow="Statutory dates"
            title="Track upcoming statutory and filing dates."
            description="Confirm that a date applies to your taxpayer category before acting on it. Dates may be extended by the relevant authority."
          />
          </div>
          <Illustration
            name="calendar-clock"
            sizes="(max-width: 1024px) 55vw, 300px"
            className="mx-auto hidden h-auto w-full max-w-[280px] lg:block"
          />
        </div>

        {unverifiedCount > 0 ? (
          <div className="mt-7 flex items-start gap-3 rounded-[10px] bg-accent-soft px-4 py-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-ink-muted">
              {unverifiedCount} of the dates listed have not yet been verified against the
              departmental notification for this period. Verify before relying on them.
            </p>
          </div>
        ) : null}
      </Section>

      <Section tone="page" size="md">
        <h2 className="display-md">Upcoming</h2>

        {upcoming.length === 0 ? (
          <p className="mt-5 rounded-[10px] border border-line p-6 text-[14px] text-ink-muted">
            No upcoming dates are currently published.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[10px] border border-line">
            {upcoming.map((event) => {
              const effective = event.extendedDueDate ?? event.dueDate;
              const days = daysUntil(effective);
              return (
                <li key={event.id} className="bg-surface p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{event.category}</Badge>
                        {event.extendedDueDate ? <Badge tone="warn">Extended</Badge> : null}
                        {!event.lastVerifiedAt ? (
                          <span className="text-[11px] text-ink-subtle">Not yet verified</span>
                        ) : null}
                      </div>

                      <p className="mt-2.5 text-[15px] font-semibold leading-snug text-ink">
                        {event.title}
                      </p>

                      {event.description ? (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                          {event.description}
                        </p>
                      ) : null}

                      {event.applicableTo ? (
                        <p className="mt-2 text-[12px] text-ink-subtle">
                          Applies to: {event.applicableTo}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-ink-subtle">
                        {event.extendedDueDate ? (
                          <span>
                            Original date{" "}
                            <span className="line-through">{formatDate(event.dueDate)}</span>
                          </span>
                        ) : null}
                        {event.lastVerifiedAt ? (
                          <span>Last verified {formatDate(event.lastVerifiedAt)}</span>
                        ) : null}
                        {event.sourceUrl ? (
                          <a
                            href={event.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[26px] items-center gap-1 py-1 text-navy hover:underline"
                          >
                            {event.sourceLabel ?? "Source"}
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-[15px] font-semibold text-ink">{formatDate(effective)}</p>
                      <div className="mt-1.5 inline-flex">
                        <Badge tone={urgencyTone(days)}>
                          <CountdownTimer
                            targetIso={deadlineInstant(effective).toISOString()}
                            compact
                          />
                        </Badge>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {past.length > 0 ? (
          <div className="mt-12">
            <h2 className="display-md">Recently passed</h2>
            <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[10px] border border-line opacity-70">
              {past.slice(0, 8).map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-ink">{event.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-subtle">{event.category}</p>
                  </div>
                  <p className="text-[13px] text-ink-muted">
                    {formatDate(event.extendedDueDate ?? event.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-10 rounded-[10px] bg-accent-soft p-5 text-[12px] leading-relaxed text-ink-muted">
          These dates are published for general reference. Applicability depends on the taxpayer or
          entity category, turnover, registration and the provisions in force. Due dates may be
          extended or altered by the relevant authority after publication. Confirm the position
          before filing.
        </p>
      </Section>
    </>
  );
}
