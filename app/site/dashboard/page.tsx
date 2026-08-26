import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, sql, desc, gte, lte } from "drizzle-orm";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { queries, professionalUpdates, complianceEvents, calculators } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import Badge, { statusTone } from "@/components/ui/Badge";
import { QUERY_STATUS_LABELS, formatDate, formatDateTime, todayInIst } from "@/lib/format";

export default async function DashboardOverview() {
  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const user = await getSessionUser();
  if (!user) redirect(p("/dashboard/login"));

  const clientId = user.clientId;
  const today = todayInIst();

  const [counts, recent, followUps, upcoming, updateCounts, calcNeedingReview] = await Promise.all([
    db
      .select({ status: queries.status, count: sql<number>`count(*)::int` })
      .from(queries)
      .where(and(eq(queries.clientId, clientId), eq(queries.isArchived, false)))
      .groupBy(queries.status),
    db
      .select()
      .from(queries)
      .where(and(eq(queries.clientId, clientId), eq(queries.isArchived, false)))
      .orderBy(desc(queries.createdAt))
      .limit(6),
    db
      .select()
      .from(queries)
      .where(
        and(
          eq(queries.clientId, clientId),
          eq(queries.isArchived, false),
          lte(queries.followUpDate, today),
        ),
      )
      .orderBy(queries.followUpDate)
      .limit(5),
    db
      .select()
      .from(complianceEvents)
      .where(
        and(
          eq(complianceEvents.clientId, clientId),
          eq(complianceEvents.isPublished, true),
          gte(sql`COALESCE(${complianceEvents.extendedDueDate}, ${complianceEvents.dueDate})`, today),
        ),
      )
      .orderBy(sql`COALESCE(${complianceEvents.extendedDueDate}, ${complianceEvents.dueDate})`)
      .limit(5),
    db
      .select({ status: professionalUpdates.status, count: sql<number>`count(*)::int` })
      .from(professionalUpdates)
      .where(eq(professionalUpdates.clientId, clientId))
      .groupBy(professionalUpdates.status),
    db
      .select()
      .from(calculators)
      .where(
        and(
          eq(calculators.clientId, clientId),
          sql`${calculators.status} IN ('ca_review_required','update_required')`,
        ),
      ),
  ]);

  const countOf = (status: string) => counts.find((c) => c.status === status)?.count ?? 0;

  // Spam is excluded from the pipeline total so conversion figures stay meaningful.
  const pipelineTotal = counts
    .filter((c) => c.status !== "spam")
    .reduce((sum, c) => sum + c.count, 0);

  const publishedUpdates = updateCounts.find((u) => u.status === "published")?.count ?? 0;
  const draftUpdates = updateCounts.find((u) => u.status === "draft")?.count ?? 0;

  const stats = [
    { label: "New", value: countOf("new"), tone: "info" as const },
    { label: "Needs follow-up", value: followUps.length, tone: "warn" as const },
    { label: "Qualified", value: countOf("qualified"), tone: "success" as const },
    { label: "Converted", value: countOf("converted"), tone: "success" as const },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md">Overview</h1>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            {pipelineTotal} {pipelineTotal === 1 ? "enquiry" : "enquiries"} in the pipeline
            {countOf("spam") > 0 ? ` · ${countOf("spam")} marked spam` : ""}
          </p>
        </div>
      </div>

      {calcNeedingReview.length > 0 ? (
        <Link
          href={p("/dashboard/calculators")}
          className="mt-6 flex items-start gap-3 rounded-[10px] border border-accent/30 bg-accent-soft px-4 py-3.5 hover:border-accent"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink">
              {calcNeedingReview.length}{" "}
              {calcNeedingReview.length === 1 ? "calculator needs" : "calculators need"} rate
              verification
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Each shows a public banner until the rates are confirmed and it is marked active.
            </p>
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        </Link>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[10px] border border-line bg-surface p-4">
            <p className="text-[12px] text-ink-subtle">{stat.label}</p>
            <p className="mt-1.5 text-[26px] font-semibold leading-none tabular-nums text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-[10px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[14px] font-semibold text-ink">Recent enquiries</p>
            <Link
              href={p("/dashboard/queries")}
              className="text-[12px] font-medium text-navy hover:underline"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-ink-muted">
              No enquiries received yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((query) => (
                <li key={query.id}>
                  <Link
                    href={p(`/dashboard/queries/${query.id}`)}
                    className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-cream"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">{query.name}</p>
                      <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                        {query.serviceLabel ?? "General enquiry"}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-subtle">
                        {formatDateTime(query.createdAt)}
                      </p>
                    </div>
                    <Badge tone={statusTone(query.status)}>
                      {QUERY_STATUS_LABELS[query.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-[10px] border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[14px] font-semibold text-ink">Follow-ups due</p>
            </div>
            {followUps.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-ink-muted">
                Nothing due today.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {followUps.map((query) => (
                  <li key={query.id}>
                    <Link
                      href={p(`/dashboard/queries/${query.id}`)}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream"
                    >
                      <p className="truncate text-[13px] text-ink">{query.name}</p>
                      <span className="shrink-0 text-[12px] text-status-warn">
                        {formatDate(query.followUpDate)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[10px] border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[14px] font-semibold text-ink">Upcoming statutory dates</p>
              <Link
                href={p("/dashboard/compliance")}
                className="text-[12px] font-medium text-navy hover:underline"
              >
                Manage
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {upcoming.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-ink">{event.title}</p>
                    {!event.lastVerifiedAt ? (
                      <p className="mt-0.5 text-[11px] text-status-warn">Not verified</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-muted">
                    {formatDate(event.extendedDueDate ?? event.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[10px] border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-ink">Professional updates</p>
              <Link
                href={p("/dashboard/updates")}
                className="text-[12px] font-medium text-navy hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="mt-3 flex gap-6">
              <div>
                <p className="text-[20px] font-semibold tabular-nums text-ink">{publishedUpdates}</p>
                <p className="text-[11px] text-ink-subtle">Published</p>
              </div>
              <div>
                <p className="text-[20px] font-semibold tabular-nums text-ink">{draftUpdates}</p>
                <p className="text-[11px] text-ink-subtle">Draft</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
