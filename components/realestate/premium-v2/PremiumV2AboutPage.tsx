import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  CheckCircle2,
  FileCheck,
  MapPin,
  Ruler,
  ShieldCheck,
  Signpost,
  Trees,
  Users,
} from "lucide-react";
import AdvisorsV2 from "./AdvisorsV2";
import BookConsultationButton from "./BookConsultationButton";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getLocalities, getProperties } from "@/lib/content";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";
import { advisorRosterFor } from "@/lib/premium-v2/advisors";
import { aboutCopyFor, type AboutIcon } from "@/lib/premium-v2/about";

const ICONS: Record<AboutIcon, typeof Award> = {
  Award,
  Users,
  Signpost,
  ShieldCheck,
  Trees,
  Ruler,
  MapPin,
  FileCheck,
};

export default async function PremiumV2AboutPage({ tenant }: { tenant: Tenant }) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const copy = aboutCopyFor(tenant.slug, settings.firmName);

  // Counted rather than asserted, the same way the home page's trust row is —
  // see lib/premium-v2/about.ts. Only fetched when the copy actually asks for
  // a counted stat, so a client whose stats are all claims pays nothing.
  const needsCounts = copy.stats.some((stat) => stat.kind !== "claim");
  const [properties, localities] = needsCounts
    ? await Promise.all([getProperties(tenant.id, {}), getLocalities(tenant.id)])
    : [[], []];

  const stats = copy.stats.map((stat) => ({
    label: stat.label,
    icon: ICONS[stat.icon],
    value:
      stat.kind === "claim"
        ? (stat.value ?? "—")
        : stat.kind === "listings"
          ? properties.length.toLocaleString("en-IN")
          : String(localities.length),
  }));

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "About", url: p("/firm-profile") },
          ]),
        )}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      {/* Unlike HeroV2 (homepage only), this page's header is always solid
          (isHome is false here), so there's no transparent-header bleed to
          restore — `<main>`'s own top padding already clears the header
          exactly. No negative margin needed. */}
      <section className="relative overflow-hidden bg-navy">
        <Image
          src={copy.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />

        <div className="gp-container relative pb-16 pt-12 lg:pb-24 lg:pt-16">
          <div className="max-w-2xl">
            <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
            <GpEyebrow className="text-[color:var(--gp-gold-300)]">{copy.heroEyebrow}</GpEyebrow>
            <h1 className="gp-hero-title font-display mt-4 text-white">{copy.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
              {copy.heroBlurb}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#advisors"
                className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
              >
                {copy.primaryCta}
              </a>
              <a
                href="#principles"
                className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/35 px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-white"
              >
                {copy.secondaryCta}
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gp-gold-300)]"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-sans text-[28px] font-semibold leading-none text-[color:var(--gp-gold-300)]">
                        {stat.value}
                      </dt>
                      <dd className="mt-1 text-[11.5px] leading-snug text-white/65">{stat.label}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────────────── */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--gp-radius-lg)] lg:sticky lg:top-24">
              <Image
                src={copy.storyImage}
                alt={copy.storyImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <GpEyebrow>{copy.storyEyebrow}</GpEyebrow>
              <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
                {copy.storyTitle}
              </h2>
              <p className="mt-5 text-[15px] font-medium leading-relaxed text-[color:var(--gp-ink)]">
                {copy.storyLead}
              </p>
              {copy.storyBody.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]"
                >
                  {paragraph}
                </p>
              ))}
              <a
                href="#principles"
                className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
              >
                Read Our Advisory Principles →
              </a>
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* ── How We Work ──────────────────────────────────────────────── */}
      <div id="principles" className="scroll-mt-24">
        <GpSection tone="cream">
          <GpContainer>
            <GpEyebrow>{copy.principlesEyebrow}</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 max-w-2xl text-[color:var(--gp-ink)]">
              {copy.principlesTitle}
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {copy.principles.map((principle) => (
                <div key={principle.label} className="border-t border-[color:var(--gp-border)] pt-5">
                  <p className="font-display text-[15px] text-[color:var(--gp-ink)]">
                    {principle.label}
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
                    {principle.detail}
                  </p>
                </div>
              ))}
            </div>
          </GpContainer>
        </GpSection>
      </div>

      {/* ── Why this belt (clients that need to sell the location itself) ─ */}
      {copy.belt ? (
        <GpSection tone="cream">
          <GpContainer>
            <div className="max-w-2xl">
              <GpEyebrow>{copy.belt.eyebrow}</GpEyebrow>
              <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
                {copy.belt.title}
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                {copy.belt.intro}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {copy.belt.items.map((item, i) => (
                <div
                  key={item.label}
                  className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white p-6"
                >
                  <span className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[color:var(--gp-gold-600)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display mt-2 text-[17px] text-[color:var(--gp-ink)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </GpContainer>
        </GpSection>
      ) : null}

      {/* ── People Before Portals ───────────────────────────────────── */}
      <div id="advisors" className="scroll-mt-24">
        <AdvisorsV2
          roster={advisorRosterFor(tenant.slug)}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
        />
      </div>

      {/* ── The Work Behind The Shortlist ───────────────────────────── */}
      <GpSection tone="forest">
        <GpContainer>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                {copy.diligenceEyebrow}
              </GpEyebrow>
              <h2 className="gp-section-title font-display mt-3 text-white">
                {copy.diligenceTitle}
              </h2>
              <ul className="mt-6 space-y-3.5">
                {copy.diligence.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[color:var(--gp-gold-300)]"
                      aria-hidden="true"
                    />
                    <span className="text-[14.5px] leading-relaxed text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <BookConsultationButton className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]">
                {copy.diligenceCta}
              </BookConsultationButton>
            </div>

            <div className="space-y-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--gp-radius-lg)]">
                <Image
                  src={copy.diligenceImage}
                  alt="Due diligence review"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {/* Compact developer strip — same real, client-confirmed logos
                  as DeveloperRibbonV2's homepage section, placed alongside
                  the due-diligence image rather than duplicated as new
                  markup. Off for clients that don't resell that inventory. */}
              {copy.showDeveloperRibbon ? (
                <div className="overflow-hidden rounded-[var(--gp-radius-lg)] bg-white/95 p-4">
                  <DeveloperRibbonMiniV2 p={p} />
                </div>
              ) : null}
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}

/**
 * A compact, logo-only reuse of DeveloperRibbonV2's real developer list for
 * this page's "Developer Ecosystem" mini-strip — DeveloperRibbonV2 itself
 * renders a full section (eyebrow, heading, dividers) that doesn't fit next
 * to the due-diligence image, so only the logo array is reused, not the
 * component markup.
 */
function DeveloperRibbonMiniV2({ p }: { p: (path: string) => string }) {
  const DEVELOPERS = [
    { src: "dlf.svg", name: "DLF" },
    { src: "emaar.svg", name: "Emaar" },
    { src: "m3m.webp", name: "M3M", invert: true },
    { src: "conscient.png", name: "Conscient" },
    { src: "ats.svg", name: "ATS" },
    { src: "godrej.svg", name: "Godrej" },
    { src: "hero-homes.jpg", name: "Hero Homes" },
  ];
  const BASE = "/verticals/realestate/templates/premium-v2/developer-logos-v2";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
      {DEVELOPERS.map((developer) => (
        <Link
          key={developer.name}
          href={p(`/properties?developer=${encodeURIComponent(developer.name)}`)}
          className="flex h-9 items-center justify-center opacity-80 transition-opacity hover:opacity-100"
        >
          <Image
            src={`${BASE}/${developer.src}`}
            alt={developer.name}
            width={100}
            height={36}
            className={`max-h-9 w-auto object-contain ${developer.invert ? "invert" : ""}`}
          />
        </Link>
      ))}
    </div>
  );
}
