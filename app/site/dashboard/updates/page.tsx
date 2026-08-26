import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { professionalUpdates } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import UpdatesManager from "@/components/dashboard/UpdatesManager";
import { formatDate } from "@/lib/format";

export default async function DashboardUpdatesPage() {
  const basePath = await getBasePath();
  const user = await getSessionUser();
  if (!user) redirect(joinPath(basePath, "/dashboard/login"));

  const rows = await db
    .select()
    .from(professionalUpdates)
    .where(eq(professionalUpdates.clientId, user.clientId))
    .orderBy(desc(professionalUpdates.updatedAt));

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="display-md">Professional updates</h1>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          A reviewer, a source and an applicable period are required before an update can be
          published.
        </p>
      </div>

      <UpdatesManager
        canDelete={user.role === "admin"}
        updates={rows.map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          category: row.category,
          status: row.status,
          excerpt: row.excerpt ?? "",
          body: row.body ?? "",
          applicableYear: row.applicableYear ?? "",
          authorName: row.authorName ?? "",
          reviewerName: row.reviewerName ?? "",
          sourceLabel: row.sources?.[0]?.label ?? "",
          sourceUrl: row.sources?.[0]?.url ?? "",
          publishedAt: row.publishedAt ? formatDate(row.publishedAt) : null,
          updatedAt: formatDate(row.updatedAt),
        }))}
      />
    </div>
  );
}
