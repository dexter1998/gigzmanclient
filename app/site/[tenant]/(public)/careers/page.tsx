import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Briefcase, Check } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Illustration from "@/components/site/Illustration";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";

export async function generateMetadata(props: PageProps<"/site/[tenant]/careers">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    alternates: { canonical: joinPath(basePathFor(tenant), "/careers") },
    title: `Careers and Articleship — ${settings?.firmName ?? ""}`,
    description:
      "Articleship and professional opportunities. Publishing job vacancies is expressly permitted under the ICAI website guidelines.",
  };
}

/**
 * Vacancies are one of the few categories the ICAI website guidelines expressly
 * permit a practice to publish, so this page carries no solicitation risk.
 */
const OPENINGS = [
  {
    title: "Article Assistant",
    type: "Articleship",
    detail:
      "For candidates who have cleared the required level of the CA course and are eligible to register for practical training.",
    exposure: [
      "Income tax return preparation and assessment support",
      "GST registration, returns and reconciliation",
      "Statutory, internal and tax audit engagements",
      "ROC filings and corporate compliance",
    ],
  },
  {
    title: "Semi-Qualified Assistant",
    type: "Full time",
    detail:
      "For candidates who have completed articleship and are pursuing the remaining group or level of the CA course.",
    exposure: [
      "Independent handling of recurring compliance",
      "Preparation of computations and audit working papers",
      "Client coordination under partner supervision",
    ],
  },
  {
    title: "Accounts Executive",
    type: "Full time",
    detail:
      "For candidates with a commerce background and working knowledge of accounting software and GST compliance.",
    exposure: [
      "Bookkeeping and bank reconciliation",
      "Periodic GST and TDS working",
      "Payroll processing support",
    ],
  },
];

export default async function CareersPage(props: PageProps<"/site/[tenant]/careers">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const settings = await getFirmSettings(tenant.id);

  const applyEmail = settings?.email || settings?.notificationEmail;

  return (
    <>
      <Section tone="tint" size="md">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-ink-subtle">
          <Link href={p("/")} className="inline-block py-1 hover:text-navy">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">Careers</span>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeader
            eyebrow="Join the firm"
            title="Articleship and professional opportunities."
            description="Training is structured around exposure to live engagements across taxation, GST, audit and corporate compliance rather than a single function."
          />
          </div>
          <Illustration
            name="growth-orange"
            sizes="(max-width: 1024px) 55vw, 300px"
            className="mx-auto hidden h-auto w-full max-w-[280px] lg:block"
          />
        </div>
      </Section>

      <Section tone="page" size="md">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
          <div className="space-y-4">
            {OPENINGS.map((opening) => (
              <Card key={opening.title}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-tint-deep">
                      {opening.type === "Articleship" ? (
                        <GraduationCap className="h-4 w-4 text-accent" aria-hidden="true" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-accent" aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{opening.title}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                        {opening.detail}
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral">{opening.type}</Badge>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                    Exposure
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {opening.exposure.map((item) => (
                      <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ink-muted">
                        <Check className="mt-1 h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <p className="text-[14px] font-semibold text-ink">How to apply</p>
              <ol className="mt-3.5 space-y-3">
                {[
                  "Send your curriculum vitae along with the level of the course you have cleared.",
                  "Mention the position you are applying for and your availability.",
                  "Shortlisted candidates are contacted for a discussion.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-relaxed text-ink-muted">{step}</span>
                  </li>
                ))}
              </ol>

              {applyEmail ? (
                <a
                  href={`mailto:${applyEmail}?subject=${encodeURIComponent("Application — Articleship / Position")}`}
                  className="mt-5 flex min-h-[42px] w-full items-center justify-center rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft"
                >
                  Email your application
                </a>
              ) : (
                <p className="mt-5 rounded-[8px] bg-tint-deep px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
                  Applications are accepted at the firm&rsquo;s office address published on the
                  contact page.
                </p>
              )}
            </Card>

            <Card>
              <p className="text-[14px] font-semibold text-ink">Registered office</p>
              <address className="mt-2.5 text-[13px] not-italic leading-relaxed text-ink-muted">
                {[settings?.addressLine, settings?.locality, settings?.region, settings?.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </address>
              <Link
                href={p("/contact")}
                className="mt-3 inline-block py-1 text-[13px] font-medium text-navy hover:underline"
              >
                Contact details
              </Link>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
