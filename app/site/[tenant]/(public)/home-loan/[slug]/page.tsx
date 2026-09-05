import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { homeLoanEnabled } from "@/lib/home-loan/enabled";
import { paramsForEachTenant } from "@/lib/static-params";
import { findAmountBySlug, LOAN_AMOUNTS } from "@/lib/home-loan/amounts";
import { findLender, rateFor, LENDERS } from "@/lib/home-loan/banks";
import {
  AmountLoanPage,
  LenderLoanPage,
} from "@/components/realestate/premium-v2/home-loan/LoanPageBodies";

/**
 * One segment serves two families — `/home-loan/50-lakh-home-loan-emi` and
 * `/home-loan/hdfc-bank` — because their slug spaces cannot collide: amount
 * slugs always end in `-home-loan-emi`, lender slugs never do. Keeping them
 * in one route avoids a `/home-loan/banks/...` prefix that would push the
 * lender name further from the start of the URL.
 */

/**
 * Prerenders every amount and lender page. Returns the FULL param set
 * including `tenant` — see lib/static-params.ts for why the parent's params
 * cannot be relied on here.
 */
export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) => {
    if (!homeLoanEnabled(tenant.slug)) return [];
    return [
      ...LOAN_AMOUNTS.map((amount) => ({ slug: amount.slug })),
      ...LENDERS.map((lender) => ({ slug: lender.slug })),
    ];
  });
}


interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};

  const [settings, basePath] = await Promise.all([getFirmSettings(tenant.id), basePathFor(tenant)]);
  const firm = settings?.firmName ?? "";
  const canonical = joinPath(basePath, `/home-loan/${slug}`);

  const amount = findAmountBySlug(slug);
  if (amount) {
    return {
      title: `${amount.label} Home Loan EMI Calculator in Gurugram — ${firm}`,
      description: `Calculate the EMI on a ${amount.plain} home loan across 5 to 30 year tenures, see the full repayment schedule, and find out what that budget buys across Gurugram's property corridors.`,
      alternates: { canonical },
    };
  }

  const lender = findLender(slug);
  if (lender) {
    const { rate, isLenderPublished } = rateFor(lender);
    return {
      title: isLenderPublished
        ? `${lender.name} Home Loan in Gurugram from ${rate}% — ${firm}`
        : `${lender.name} Home Loan in Gurugram — ${firm}`,
      description: `Check indicative eligibility for a ${lender.name} home loan in Gurugram. Published rates, processing fees and documents, with application support from an authorised channel partner.`,
      alternates: { canonical },
    };
  }

  return {};
}

export default async function HomeLoanSlugPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !homeLoanEnabled(tenant.slug)) notFound();

  if (findAmountBySlug(slug)) {
    return <AmountLoanPage tenant={tenant} amountSlug={slug} />;
  }
  if (findLender(slug)) {
    return <LenderLoanPage tenant={tenant} lenderSlug={slug} />;
  }
  notFound();
}
