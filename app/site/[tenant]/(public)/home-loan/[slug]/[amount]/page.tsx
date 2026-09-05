import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { homeLoanEnabled } from "@/lib/home-loan/enabled";
import { paramsForEachTenant } from "@/lib/static-params";
import { findAmountByStem, LOAN_AMOUNTS, amountSlugStem } from "@/lib/home-loan/amounts";
import { findLender, rateFor, LENDERS } from "@/lib/home-loan/banks";
import { AmountLoanPage } from "@/components/realestate/premium-v2/home-loan/LoanPageBodies";

/** `/home-loan/{lender}/{amount}` — the lender × amount matrix. */

/** Prerenders the full lender x amount matrix for DSA-enabled tenants. */
export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) => {
    if (!homeLoanEnabled(tenant.slug)) return [];
    return LENDERS.flatMap((lender) =>
      LOAN_AMOUNTS.map((amount) => ({ slug: lender.slug, amount: amountSlugStem(amount) })),
    );
  });
}


interface Props {
  params: Promise<{ tenant: string; slug: string; amount: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug, amount: amountStem } = await params;
  const lender = findLender(slug);
  const amount = findAmountByStem(amountStem);
  if (!lender || !amount) return {};

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const [settings, basePath] = await Promise.all([getFirmSettings(tenant.id), basePathFor(tenant)]);
  const firm = settings?.firmName ?? "";
  const { rate, isLenderPublished } = rateFor(lender);

  return {
    title: isLenderPublished
      ? `${lender.name} ${amount.label} Home Loan EMI at ${rate}% — ${firm}`
      : `${lender.name} ${amount.label} Home Loan EMI — ${firm}`,
    description: `EMI on a ${amount.plain} ${lender.name} home loan across 5 to 30 year tenures, with eligibility, documents and what that budget buys in Gurugram.`,
    alternates: { canonical: joinPath(basePath, `/home-loan/${slug}/${amountStem}`) },
  };
}

export default async function LenderAmountPage({ params }: Props) {
  const { tenant: tenantSlug, slug, amount } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !homeLoanEnabled(tenant.slug)) notFound();
  if (!findLender(slug) || !findAmountByStem(amount)) notFound();

  return <AmountLoanPage tenant={tenant} amountSlug={amount} lenderSlug={slug} />;
}
