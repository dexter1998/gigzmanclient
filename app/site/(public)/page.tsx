import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import HeroVisual from "@/components/site/HeroVisual";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import {
  getFirmSettings,
  getServices,
  getUpcomingCompliance,
  getPublishedUpdates,
  getCalculators,
} from "@/lib/content";
import { SERVICE_CATEGORY_LABELS, formatDate } from "@/lib/format";

export async function generateMetadata() {
  const tenant = await getTenant();
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: settings?.seoTitle ?? settings?.firmName,
    description: settings?.seoDescription ?? settings?.overview?.slice(0, 160),
  };
}

const ENGAGEMENT_STEPS = [
  { step: "Requirement", detail: "You share what you need and the relevant circumstances." },
  { step: "Review", detail: "The requirement is reviewed and applicability confirmed." },
  { step: "Scope", detail: "Scope, responsibilities and timelines are agreed in writing." },
  { step: "Execution", detail: "Work is carried out and progress communicated." },
];

export default async function HomePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
  const p = (path: string) => joinPath(basePath, path);

  const [settings, services, compliance, updates, calculators] = await Promise.all([
    getFirmSettings(tenant.id),
    getServices(tenant.id),
    getUpcomingCompliance(tenant.id),
    getPublishedUpdates(tenant.id),
    getCalculators(tenant.id),
  ]);

  if (!settings) notFound();

  const categories = [...new Set(services.map((s) => s.category))];
  const nextDeadline = compliance[0];

  return (
    <>
      {/* Hero */}
      <Section tone="cream" size="lg">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="eyebrow">{settings.businessCategory ?? "Chartered Accountants"}</p>
            <h1 className="display-xl mt-4">
              Clarity for your finances.
              <br className="hidden sm:block" /> Confidence for your business.
            </h1>
            <p className="prose-body mt-5 max-w-xl text-[15px] sm:text-base">
              {settings.overview}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={p("/contact")}>
                Discuss Your Requirement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href={p("/services")} variant="secondary">
                Explore Services
              </Button>
            </div>

            {settings.locality ? (
              <p className="mt-6 text-[13px] text-ink-subtle">
                {settings.locality}
                {settings.region ? `, ${settings.region}` : ""}
              </p>
            ) : null}
          </div>

          <HeroVisual
            nextDeadline={
              nextDeadline
                ? {
                    title: nextDeadline.title,
                    date: formatDate(nextDeadline.extendedDueDate ?? nextDeadline.dueDate),
                  }
                : null
            }
          />
        </div>
      </Section>

      {/* Services */}
      <Section tone="white">
        <SectionHeader
          eyebrow="Areas of practice"
          title="Professional services for recurring and strategic requirements"
          description="Engagements are accepted after reviewing the requirement and confirming that the firm can support it."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const items = services.filter((s) => s.category === category);
            return (
              <Card key={category} href={p(`/services#${category}`)}>
                <p className="text-[15px] font-semibold text-ink">
                  {SERVICE_CATEGORY_LABELS[category] ?? category}
                </p>
                <ul className="mt-3.5 space-y-2">
                  {items.slice(0, 4).map((item) => (
                    <li key={item.id} className="flex gap-2 text-[13px] text-ink-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                      {item.title}
                    </li>
                  ))}
                </ul>
                {items.length > 4 ? (
                  <p className="mt-3 text-[12px] text-ink-subtle">
                    +{items.length - 4} more in this area
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-navy">
                  View services
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Compliance dates */}
      {compliance.length > 0 ? (
        <Section tone="cream">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Statutory calendar"
              title="Keep important filing dates visible."
            />
            <Button href={p("/compliance-calendar")} variant="secondary" size="sm">
              Open calendar
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {compliance.slice(0, 3).map((event) => (
              <Card key={event.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-accent">
                      {formatDate(event.extendedDueDate ?? event.dueDate)}
                    </p>
                    <p className="mt-1.5 text-[14px] font-medium leading-snug text-ink">
                      {event.title}
                    </p>
                  </div>
                  <Badge tone="neutral">{event.category}</Badge>
                </div>
                {event.applicableTo ? (
                  <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
                    {event.applicableTo}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Calculators */}
      {calculators.length > 0 ? (
        <Section tone="white">
          <SectionHeader
            eyebrow="Tools"
            title="Estimate before you discuss."
            description="Indicative estimates only. Results are not a substitute for professional advice."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calc) => (
              <Card key={calc.id} href={p(`/calculators/${calc.key}`)}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] font-semibold text-ink">{calc.title}</p>
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">
                  {calc.description}
                </p>
                <p className="mt-3 text-[12px] text-ink-subtle">{calc.taxYear}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-navy">
                  Open calculator
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Engagement process */}
      <Section tone="cream">
        <SectionHeader
          eyebrow="How engagements work"
          title="A defined process, agreed before work begins."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENGAGEMENT_STEPS.map((item, i) => (
            <Card key={item.step}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[12px] font-semibold text-white">
                {i + 1}
              </span>
              <p className="mt-4 text-[14px] font-semibold text-ink">{item.step}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{item.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Updates */}
      {updates.length > 0 ? (
        <Section tone="white">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader eyebrow="Professional updates" title="Recent notes on tax and compliance." />
            <Button href={p("/updates")} variant="secondary" size="sm">
              All updates
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {updates.slice(0, 3).map((update) => (
              <Card key={update.id} href={p(`/updates/${update.slug}`)}>
                <div className="flex items-center gap-2">
                  <Badge tone="accent">{update.category}</Badge>
                  {update.applicableYear ? (
                    <span className="text-[11px] text-ink-subtle">{update.applicableYear}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-[15px] font-semibold leading-snug text-ink">
                  {update.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{update.excerpt}</p>
                <p className="mt-4 text-[12px] text-ink-subtle">
                  {formatDate(update.publishedAt)}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Closing CTA */}
      <Section tone="cream" size="lg">
        <div className="relative overflow-hidden rounded-[16px] bg-navy px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="display-lg text-white">
              Discuss the requirement before deciding the engagement.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Share what you need and the relevant circumstances. The requirement is reviewed before
              any engagement is accepted.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href={p("/contact")} variant="onNavy">
                Submit Requirement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              {settings.phone ? (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[8px] border border-white/25 px-5 text-[14px] font-medium text-white hover:bg-white/10"
                >
                  {settings.phone}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
