import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, desc, sql } from "drizzle-orm";
import { Inbox } from "lucide-react";
import { db } from "@/lib/db";
import { queries } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import Badge, { statusTone } from "@/components/ui/Badge";
import { QUERY_STATUS_LABELS, formatDate, formatDateTime } from "@/lib/format";

export default async function QueriesPage(props: PageProps<"/site/[tenant]/dashboard/queries">) {
  const searchParams = await props.searchParams;
  const activeStatus = typeof searchParams.status === "string" ? searchParams.status : null;
  const showArchived = searchParams.archived === "1";

  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const user = await getSessionUser();
  if (!user) redirect(p("/dashboard/login"));

  const conditions = [
    eq(queries.clientId, user.clientId),
    eq(queries.isArchived, showArchived),
  ];
  if (activeStatus) {
    conditions.push(sql`${queries.status} = ${activeStatus}`);
  }

  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(queries)
      .where(and(...conditions))
      .orderBy(desc(queries.createdAt))
      .limit(100),
    db
      .select({ status: queries.status, count: sql<number>`count(*)::int` })
      .from(queries)
      .where(and(eq(queries.clientId, user.clientId), eq(queries.isArchived, false)))
      .groupBy(queries.status),
  ]);

  const countOf = (status: string) => counts.find((c) => c.status === status)?.count ?? 0;

  const filterHref = (status: string | null) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (showArchived) params.set("archived", "1");
    const qs = params.toString();
    return p(`/dashboard/queries${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md">Queries</h1>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            {rows.length} {showArchived ? "archived" : "active"}{" "}
            {rows.length === 1 ? "enquiry" : "enquiries"}
          </p>
        </div>
        <Link
          href={
            showArchived
              ? p("/dashboard/queries")
              : p("/dashboard/queries?archived=1")
          }
          className="text-[13px] font-medium text-navy hover:underline"
        >
          {showArchived ? "View active" : "View archived"}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={filterHref(null)}
          className={`min-h-[34px] rounded-full border px-3 py-1.5 text-[12px] ${
            !activeStatus
              ? "border-navy bg-navy text-white"
              : "border-line-strong bg-surface text-ink-muted hover:border-navy"
          }`}
        >
          All
        </Link>
        {Object.entries(QUERY_STATUS_LABELS).map(([status, label]) => (
          <Link
            key={status}
            href={filterHref(status)}
            className={`min-h-[34px] rounded-full border px-3 py-1.5 text-[12px] ${
              activeStatus === status
                ? "border-navy bg-navy text-white"
                : "border-line-strong bg-surface text-ink-muted hover:border-navy"
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-60">{countOf(status)}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-[10px] border border-line bg-surface px-6 py-14 text-center">
          <Inbox className="mx-auto h-7 w-7 text-ink-subtle" aria-hidden="true" />
          <p className="mt-3 text-[14px] font-medium text-ink">No enquiries here</p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Enquiries submitted through the website contact form appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Table on wide screens */}
          <div className="mt-6 hidden overflow-hidden rounded-[10px] border border-line bg-surface lg:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-tint text-left text-[11px] uppercase tracking-[0.06em] text-ink-subtle">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Requirement</th>
                  <th className="px-4 py-3 font-medium">Via page</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((query) => (
                  <tr key={query.id} className="hover:bg-tint">
                    <td className="px-4 py-3">
                      <Link
                        href={p(`/dashboard/queries/${query.id}`)}
                        className="font-mono text-[12px] font-medium text-navy hover:underline"
                      >
                        {query.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink">{query.name}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {query.serviceLabel ?? "General enquiry"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <span className="font-mono text-[12px]">{viaPage(query.landingPage)}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(query.createdAt)}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {query.followUpDate ? formatDate(query.followUpDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(query.status)}>
                        {QUERY_STATUS_LABELS[query.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on narrow screens — a six-column table is unreadable on a phone */}
          <ul className="mt-6 space-y-3 lg:hidden">
            {rows.map((query) => (
              <li key={query.id}>
                <Link
                  href={p(`/dashboard/queries/${query.id}`)}
                  className="block rounded-[10px] border border-line bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink">{query.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-subtle">
                        {query.reference}
                      </p>
                    </div>
                    <Badge tone={statusTone(query.status)}>
                      {QUERY_STATUS_LABELS[query.status]}
                    </Badge>
                  </div>
                  <p className="mt-2.5 text-[13px] text-ink-muted">
                    {query.serviceLabel ?? "General enquiry"}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-ink-subtle">
                    {viaPage(query.landingPage)}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-subtle">
                    {formatDateTime(query.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * Which page the enquiry was submitted from.
 *
 * Forms record `window.location.pathname`, which on the shared deployment
 * carries the `/{vertical}/{template}/{slug}` prefix — noise in a per-client
 * dashboard, and wide enough to push the table into a scroll. This trims the
 * prefix so the column reads as the page the visitor was actually on.
 */
function viaPage(landingPage: string | null): string {
  if (!landingPage) return "—";
  const trimmed = landingPage.replace(/^\/[a-z-]+\/temp-[a-z0-9-]+\/[a-z0-9-]+/, "");
  return trimmed === "" ? "/" : trimmed;
}
