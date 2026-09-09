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
/**
 * Deliberately empty, for the same reason as the vastu sector pages: every
 * lender x loan-amount combination is one prerendered page, and these run
 * roughly 860KB each of HTML, RSC payload and segments. 524 of them is 452MB
 * of build output paid on every deployment.
 *
 * `dynamicParams` defaults to true, so each URL still renders on first
 * request and is cached from then on. The lender pages one level up stay
 * prerendered — those are the ones that actually get linked and crawled.
 */
export async function generateStaticParams() {
  return [];
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
