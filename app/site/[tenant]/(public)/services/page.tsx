import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ServiceIcon from "@/components/site/ServiceIcon";
import Illustration from "@/components/site/Illustration";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings, getServices } from "@/lib/content";
import { SERVICE_CATEGORY_LABELS } from "@/lib/format";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";

export async function generateMetadata(props: PageProps<"/site/[tenant]/services">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Services — ${settings?.firmName ?? ""}`,
    description:
      "Taxation, GST, audit and corporate compliance services. Availability is confirmed after reviewing the requirement.",
  };
}

export default async function ServicesPage(props: PageProps<"/site/[tenant]/services">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const services = await getServices(tenant.id);

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Services", url: p("/services") },
          ]),
        )}
      />

      <Section tone="tint" size="md">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
          <a href={p("/")} className="inline-block py-1 hover:text-navy">
            Home
          </a>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">Services</span>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeader
            eyebrow="Areas of practice"
            title="Professional services organised around your requirement."
            description="Explore taxation, GST, audit and business services. Availability for a specific engagement is confirmed after review."
          />
          </div>
          <Illustration
            name="documents-shield"
            sizes="(max-width: 1024px) 55vw, 300px"
            className="mx-auto hidden h-auto w-full max-w-[280px] lg:block"
          />
        </div>
      </Section>

      <Section tone="page" size="md">
        <div className="space-y-14">
          {categories.map((category) => {
            const items = services.filter((s) => s.category === category);
            return (
              <div key={category} id={category} className="scroll-mt-24">
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                  <h2 className="display-md">
                    {SERVICE_CATEGORY_LABELS[category] ?? category}
                  </h2>
                  <span className="shrink-0 text-[12px] text-ink-subtle">
                    {items.length} {items.length === 1 ? "service" : "services"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {items.map((service) => (
                    <Card key={service.id} href={p(`/services/${service.slug}`)} interactive>
                      <div className="flex items-start gap-3.5">
                        <ServiceIcon slug={service.slug} category={service.category} boxed />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[15px] font-semibold leading-snug text-ink">
                              {service.title}
                            </p>
                            {service.isCaExclusive ? (
                              <Badge tone="info" className="shrink-0">
                                CA
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                            {service.summary}
                          </p>
                        </div>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-navy">
                        Read more
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
