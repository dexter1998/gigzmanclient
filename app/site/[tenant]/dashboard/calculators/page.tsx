import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { calculators } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import CalculatorManager from "@/components/dashboard/CalculatorManager";
import { formatDate } from "@/lib/format";

export default async function DashboardCalculatorsPage() {
  const basePath = await getBasePath();
  const user = await getSessionUser();
  if (!user) redirect(joinPath(basePath, "/dashboard/login"));

  // Promoting a calculator asserts the rates have been verified, so this screen
  // is administrator-only and the sidebar hides it from editors.
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="display-md">Calculators</h1>
        <p className="mt-4 rounded-[10px] border border-line bg-surface p-6 text-[14px] text-ink-muted">
          Calculator status is managed by an administrator. Marking a calculator active confirms
          that its rate set has been professionally verified.
        </p>
      </div>
    );
  }

  const rows = await db
    .select()
    .from(calculators)
    .where(eq(calculators.clientId, user.clientId))
    .orderBy(asc(calculators.sortOrder));

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="display-md">Calculators</h1>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          Formulas and rate tables live in the codebase and are not editable here. This screen
          controls whether a calculator is presented as verified.
        </p>
      </div>

      <CalculatorManager
        calculators={rows.map((row) => ({
          id: row.id,
          key: row.key,
          title: row.title,
          description: row.description ?? "",
          version: row.version,
          taxYear: row.taxYear,
          status: row.status,
          reviewerName: row.reviewerName ?? "",
          disclaimer: row.disclaimer ?? "",
          lastReviewedAt: row.lastReviewedAt ? formatDate(row.lastReviewedAt) : null,
        }))}
      />
    </div>
  );
}
