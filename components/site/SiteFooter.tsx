import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import SocialIcon, { SUPPORTED_SOCIALS } from "./SocialIcon";
import BrandMark from "./BrandMark";
import { joinPath } from "@/lib/tenant";
import { formatDate } from "@/lib/format";
import type { firmSettings } from "@/lib/db/schema";
import type { VerticalConfig } from "@/lib/verticals";

interface SiteFooterProps {
  settings: typeof firmSettings.$inferSelect;
  basePath: string;
  categories: string[];
  vertical: VerticalConfig;
}

export default function SiteFooter({ settings, basePath, categories, vertical }: SiteFooterProps) {
  const p = (path: string) => joinPath(basePath, path);
  const categoryLabel = (value: string) =>
    vertical.serviceCategories.find((c) => c.value === value)?.label ?? value;

  // Address is composed from the same fields the JSON-LD uses, so the two cannot diverge.
  const addressParts = [
    settings.addressLine,
    settings.locality,
    settings.region,
    settings.postalCode,
  ].filter(Boolean);

  const socials = Object.entries(settings.socialLinks ?? {}).filter(
    ([key, url]) => url && SUPPORTED_SOCIALS.includes(key.toLowerCase()),
  );
  const openDays = (settings.openingHours ?? []).filter((h) => !h.closed);
  const hoursSummary =
    openDays.length > 0
      ? `${openDays[0].day.slice(0, 3)} – ${openDays[openDays.length - 1].day.slice(0, 3)}: ${openDays[0].opens} – ${openDays[0].closes}`
      : null;

  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              {/* Supplied artwork is dark-on-transparent, so it sits on a light
                  chip here; the built-in fallback inverts instead. */}
              {settings.logoUrl ? (
                <span className="flex h-12 w-[62px] shrink-0 items-center justify-center rounded-[9px] bg-white p-1.5">
                  <BrandMark
                    className="h-full w-full"
                    src={settings.logoUrl}
                    alt={settings.firmName}
                    vertical={vertical.id}
                  />
                </span>
              ) : (
                <BrandMark className="h-12 w-[56px] shrink-0" onDark vertical={vertical.id} />
              )}

              <span className="leading-tight">
                <span className="block whitespace-nowrap font-display text-[16px] font-medium">
                  {settings.firmName}
                </span>
                {settings.businessCategory ? (
                  <span className="mt-0.5 block whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">
                    {settings.businessCategory}
                  </span>
                ) : null}
              </span>
            </div>

            {settings.tagline ? (
              <p className="mt-4 text-[13px] leading-relaxed text-white/55">{settings.tagline}</p>
            ) : null}

            {socials.length > 0 ? (
              <ul className="mt-5 flex gap-2">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    >
                      <SocialIcon name={key} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <FooterColumn title="Quick Links">
            {vertical.footer.quickLinks.map((link) => (
              <FooterLink key={link.path} href={p(link.path)}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Services">
            {categories.map((category) => (
              <FooterLink key={category} href={p(`/services#${category}`)}>
                {categoryLabel(category)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Resources">
            {vertical.footer.resourceLinks.map((link) => (
              <FooterLink key={link.path} href={p(link.path)}>
                {link.label}
              </FooterLink>
            ))}
            {vertical.footer.externalLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-[13px] text-white/60 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Get in Touch">
            {addressParts.length > 0 ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <address className="text-[13px] not-italic leading-relaxed text-white/60">
                  {addressParts.join(", ")}
                </address>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-block py-1 text-[13px] text-white/60 hover:text-white"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.phone ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="inline-block py-1 text-[13px] text-white/60 hover:text-white"
                >
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {hoursSummary ? (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span className="text-[13px] leading-relaxed text-white/60">{hoursSummary}</span>
              </li>
            ) : null}
          </FooterColumn>
        </div>

        <div className="mt-11 border-t border-white/10 pt-6">
          {/*
            Every vertical carries a regulatory-notice string in its config —
            ICAI's no-solicitation position for accountancy, RERA's registration
            requirement for real estate. Neither is optional boilerplate.
          */}
          <p className="text-[12px] leading-relaxed text-white/40">{vertical.footer.regulatoryNotice}</p>
          <p className="mt-3 text-[12px] leading-relaxed text-white/40">
            Content on this website is general information and does not constitute professional
            advice. No outcome is assured. Professional advice should be obtained before acting on
            any content published here.
          </p>

          <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-white/40">
              © {new Date().getFullYear()} {settings.firmName}
              {settings.firmRegistrationNumber
                ? ` · ${vertical.footer.registrationLabel} ${settings.firmRegistrationNumber}`
                : ""}
              {settings.establishedYear ? ` · Est. ${settings.establishedYear}` : ""}
              {" · Updated "}
              {formatDate(settings.updatedAt)}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {vertical.footer.legalSlugs.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={p(`/legal/${link.slug}`)}
                    className="inline-block py-1 text-[12px] text-white/40 hover:text-white/80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.11em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-block py-1 text-[13px] text-white/60 hover:text-white">
        {children}
      </Link>
    </li>
  );
}
