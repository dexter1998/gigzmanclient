import { notFound } from "next/navigation";
import CalculatorShell from "@/components/site/CalculatorShell";
import IncomeTaxCalculator from "@/components/site/calculators/IncomeTaxCalculator";
import TdsCalculator from "@/components/site/calculators/TdsCalculator";
import GstCalculator from "@/components/site/calculators/GstCalculator";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import { getFirmSettings, getCalculator } from "@/lib/content";
import type { AgeCategory } from "@/lib/calculators/income-tax";
import type { AmountType } from "@/lib/calculators/gst";

export async function generateMetadata(props: PageProps<"/site/calculators/[key]">) {
  const { key } = await props.params;
  const tenant = await getTenant();
  if (!tenant) return {};
  const [settings, calculator] = await Promise.all([
    getFirmSettings(tenant.id),
    getCalculator(tenant.id, key),
  ]);
  if (!calculator) return {};
  return {
    title: `${calculator.title} — ${settings?.firmName ?? ""}`,
    description: calculator.description ?? undefined,
  };
}

const AGE_CATEGORIES: AgeCategory[] = ["general", "senior", "superSenior"];

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function CalculatorPage(props: PageProps<"/site/calculators/[key]">) {
  const { key } = await props.params;
  const searchParams = await props.searchParams;

  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);
  const calculator = await getCalculator(tenant.id, key);

  if (!calculator || calculator.status === "archived") notFound();

  const shared = {
    calculatorKey: calculator.key,
    version: calculator.version,
    taxYear: calculator.taxYear,
  };

  // Values handed over from the picker. They live in the URL only — nothing here
  // is persisted or sent anywhere.
  const age = str(searchParams.age);
  const rate = str(searchParams.rate);
  const amountType = str(searchParams.type);

  return (
    <CalculatorShell
      calculator={calculator}
      contactHref={p("/contact")}
      breadcrumbHref={p("/calculators")}
    >
      {calculator.key === "income-tax" ? (
        <IncomeTaxCalculator
          {...shared}
          initial={{
            salary: str(searchParams.salary),
            deductions: str(searchParams.deductions),
            age: AGE_CATEGORIES.includes(age as AgeCategory) ? (age as AgeCategory) : undefined,
          }}
        />
      ) : null}

      {calculator.key === "tds" ? (
        <TdsCalculator
          {...shared}
          initial={{
            section: str(searchParams.section),
            payment: str(searchParams.payment),
            panAvailable: str(searchParams.pan) === undefined ? undefined : searchParams.pan !== "0",
          }}
        />
      ) : null}

      {calculator.key === "gst" ? (
        <GstCalculator
          {...shared}
          initial={{
            amount: str(searchParams.amount),
            rate: rate !== undefined && !Number.isNaN(Number(rate)) ? Number(rate) : undefined,
            amountType:
              amountType === "inclusive" || amountType === "exclusive"
                ? (amountType as AmountType)
                : undefined,
          }}
        />
      ) : null}
    </CalculatorShell>
  );
}
