import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { joinPath } from "@/lib/tenant";
import { SERVICE_CATEGORY_LABELS, formatDate } from "@/lib/format";
import type { firmSettings } from "@/lib/db/schema";

interface SiteFooterProps {
  settings: typeof firmSettings.$inferSelect;
  basePath: string;
  categories: string[];
}

const LEGAL_LINKS = [
  { label: "Privacy Policy", slug: "privacy-policy" },
  { label: "Terms of Use", slug: "terms-of-use" },
  { label: "Disclaimer", slug: "disclaimer" },
  { label: "Calculator Disclaimer", slug: "calculator-disclaimer" },
  { label: "Cookie Notice", slug: "cookie-notice" },
];

/** Links to regulatory portals are expressly permitted under the ICAI website guidelines. */
const GOVERNMENT_LINKS = [
  { label: "Income Tax e-Filing", url: "https://www.incometax.gov.in" },
  { label: "GST Portal", url: "https://www.gst.gov.in" },
  { label: "MCA", url: "https://www.mca.gov.in" },
  { label: "TRACES", url: "https://www.tdscpc.gov.in" },
  { label: "EPFO", url: "https://www.epfindia.gov.in" },
  { label: "ICAI", url: "https://www.icai.org" },
];

export default function SiteFooter({ settings, basePath, categories }: SiteFooterProps) {
  const p = (path: string) => joinPath(basePath, path);

  // Address is composed from the same fields the JSON-LD uses, so the two cannot diverge.
  const addressParts = [
    settings.addressLine,
    settings.locality,
    settings.region,
    settings.postalCode,
  ].filter(Boolean);

  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-[15px] font-semibold">{settings.firmName}</p>
            {settings.businessCategory ? (
              <p className="mt-1 text-[13px] text-white/60">{settings.businessCategory}</p>
            ) : null}
            {settings.overview ? (
              <p className="mt-4 text-[13px] leading-relaxed text-white/60">
                {settings.overview.slice(0, 160)}
                {settings.overview.length > 160 ? "…" : ""}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
              Services
            </p>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={p(`/services#${category}`)}
                    className="inline-block py-1 text-[13px] text-white/70 hover:text-white"
                  >
                    {SERVICE_CATEGORY_LABELS[category] ?? category}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={p("/services")} className="inline-block py-1 text-[13px] text-white/70 hover:text-white">
                  All services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href={p("/calculators")} className="inline-block py-1 text-[13px] text-white/70 hover:text-white">
                  Calculators
                </Link>
              </li>
              <li>
                <Link href={p("/updates")} className="inline-block py-1 text-[13px] text-white/70 hover:text-white">
                  Professional Updates
                </Link>
              </li>
              <li>
                <Link
                  href={p("/compliance-calendar")}
                  className="inline-block py-1 text-[13px] text-white/70 hover:text-white"
                >
                  Compliance Calendar
                </Link>
              </li>
              <li>
                <Link href={p("/knowledge")} className="inline-block py-1 text-[13px] text-white/70 hover:text-white">
                  Knowledge Centre
                </Link>
              </li>
              <li>
                <Link href={p("/faq")} className="inline-block py-1 text-[13px] text-white/70 hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href={p("/careers")} className="inline-block py-1 text-[13px] text-white/70 hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
              Regulatory portals
            </p>
            <ul className="mt-4 space-y-2.5">
              {GOVERNMENT_LINKS.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-1 text-[13px] text-white/70 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
              Contact
            </p>
            <ul className="mt-4 space-y-3">
              {addressParts.length > 0 ? (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden="true" />
                  <address className="text-[13px] not-italic leading-relaxed text-white/70">
                    {addressParts.join(", ")}
                  </address>
                </li>
              ) : null}
              {settings.phone ? (
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden="true" />
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="inline-block py-1 text-[13px] text-white/70 hover:text-white"
                  >
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden="true" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-block py-1 text-[13px] text-white/70 hover:text-white"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          {/*
            Chartered accountants in practice may not solicit work or advertise. This notice
            is the standard position adopted across ICAI-registered practice websites and
            frames the site as information provided on the visitor's own request.
          */}
          <p className="text-[12px] leading-relaxed text-white/45">
            In accordance with the Chartered Accountants Act, 1949 and the guidelines issued by
            the Institute of Chartered Accountants of India, this website is not an advertisement
            and does not solicit work. There has been no advertisement, personal communication,
            solicitation, invitation or inducement of any kind from the firm to create a
            professional relationship through this website. Information published here is made
            available only at the visitor&rsquo;s own request and for their own information.
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-white/45">
            Content on this website is general information and does not constitute professional
            advice. No outcome is assured. Professional advice should be obtained before acting on
            any content published here.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-white/45">
              © {new Date().getFullYear()} {settings.firmName}
              {settings.firmRegistrationNumber ? ` · ICAI FRN ${settings.firmRegistrationNumber}` : ""}
              {settings.establishedYear ? ` · Established ${settings.establishedYear}` : ""}
              {" · "}
              <span>Last updated {formatDate(settings.updatedAt)}</span>
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={p(`/legal/${link.slug}`)}
                    className="inline-block py-1 text-[12px] text-white/45 hover:text-white/80"
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
