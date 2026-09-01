import Link from "next/link";
import Image from "next/image";
import { ArrowRight, type LucideIcon } from "lucide-react";

/**
 * Section-level building blocks shared by the four real-estate templates.
 *
 * These are layout primitives only — spacing, heading rhythm, band tone.
 * Each template composes them differently and supplies its own copy,
 * imagery and section order, which is where the four directions actually
 * diverge. Anything visually specific to one template lives in that
 * template's own file, not here.
 */

export function Band({
  children,
  tone = "surface",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "surface" | "tint" | "tint-deep" | "navy";
  className?: string;
}) {
  const TONES = {
    surface: "bg-surface border-b border-line",
    tint: "bg-tint border-b border-line",
    "tint-deep": "bg-tint-deep border-b border-line",
    navy: "bg-navy text-white",
  };
  return (
    <section className={`${TONES[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionTitle({
  title,
  subtitle,
  href,
  linkLabel,
  align = "left",
  onNavy = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  onNavy?: boolean;
}) {
  if (align === "center") {
    return (
      <div className="text-center">
        <h2 className={`display-md ${onNavy ? "text-white" : ""}`}>{title}</h2>
        {subtitle ? (
          <p className={`mx-auto mt-2 max-w-xl text-[14px] ${onNavy ? "text-white/70" : "text-ink-muted"}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className={`display-md ${onNavy ? "text-white" : ""}`}>{title}</h2>
        {subtitle ? (
          <p className={`mt-2 max-w-xl text-[14px] ${onNavy ? "text-white/70" : "text-ink-muted"}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className={`inline-flex min-h-[38px] items-center gap-1.5 py-1 text-[13px] font-medium ${
            onNavy ? "text-white hover:text-accent-ring" : "text-navy hover:text-accent"
          }`}
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

/** Icon + title + detail, used by trust strips and feature grids across templates. */
export function FeatureItem({
  icon: Icon,
  title,
  detail,
  boxed = false,
  onNavy = false,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  boxed?: boolean;
  onNavy?: boolean;
}) {
  const body = (
    <>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${
          onNavy ? "bg-white/10" : "bg-accent-soft"
        }`}
      >
        <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
      </span>
      <div>
        <p className={`text-[13.5px] font-semibold ${onNavy ? "text-white" : "text-ink"}`}>{title}</p>
        <p className={`mt-1 text-[12.5px] leading-relaxed ${onNavy ? "text-white/65" : "text-ink-subtle"}`}>
          {detail}
        </p>
      </div>
    </>
  );

  if (boxed) {
    return <div className="flex gap-3 rounded-[10px] border border-line bg-surface p-5">{body}</div>;
  }
  return <div className="flex gap-3">{body}</div>;
}

/** Developer logo strip — real partner marks, supplied by the client. */
export function DeveloperLogos({ logos }: { logos: { src: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {logos.map((logo) => (
        <div
          key={logo.name}
          className="flex h-[76px] items-center justify-center rounded-[10px] border border-line bg-surface px-4"
        >
          <Image
            src={logo.src}
            alt={logo.name}
            width={120}
            height={44}
            className="max-h-[40px] w-auto object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export const DEVELOPER_LOGOS = [
  { src: "/verticals/realestate/templates/premium-inventory/developer-logos/aipl.png", name: "AIPL" },
  { src: "/verticals/realestate/templates/premium-inventory/developer-logos/chd-developer.png", name: "CHD Developers" },
  { src: "/verticals/realestate/templates/premium-inventory/developer-logos/krisumi.png", name: "Krisumi" },
  { src: "/verticals/realestate/templates/premium-inventory/developer-logos/omaxe.png", name: "Omaxe" },
  { src: "/verticals/realestate/templates/premium-inventory/developer-logos/shapoorji-pallonji.png", name: "Shapoorji Pallonji" },
  { src: "/verticals/realestate/templates/premium-inventory/developer-logos/vatika.png", name: "Vatika" },
];
