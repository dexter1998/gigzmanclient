import { notFound } from "next/navigation";
import CalculatorShell from "@/components/site/CalculatorShell";
import IncomeTaxCalculator from "@/components/site/calculators/IncomeTaxCalculator";
import TdsCalculator from "@/components/site/calculators/TdsCalculator";
import GstCalculator from "@/components/site/calculators/GstCalculator";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import { getFirmSettings, getCalculator } from "@/lib/content";

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

export default async function CalculatorPage(props: PageProps<"/site/calculators/[key]">) {
  const { key } = await props.params;
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

  return (
    <CalculatorShell
      calculator={calculator}
      contactHref={p("/contact")}
      breadcrumbHref={p("/calculators")}
    >
      {calculator.key === "income-tax" ? <IncomeTaxCalculator {...shared} /> : null}
      {calculator.key === "tds" ? <TdsCalculator {...shared} /> : null}
      {calculator.key === "gst" ? <GstCalculator {...shared} /> : null}
    </CalculatorShell>
  );
}
