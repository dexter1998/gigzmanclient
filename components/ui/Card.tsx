import Link from "next/link";

type Tone = "surface" | "navy" | "tint";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  padded?: boolean;
  /** Lifts on hover with an accent border — used for the service and article grids. */
  interactive?: boolean;
  tone?: Tone;
}

/**
 * Background is set through `tone` rather than a className override: two
 * background utilities carry equal specificity, so an override would win or lose
 * on stylesheet order rather than intent.
 */
const TONES: Record<Tone, string> = {
  surface: "border-line bg-surface",
  navy: "border-navy bg-navy text-white",
  tint: "border-line bg-tint",
};

export default function Card({
  children,
  href,
  className = "",
  padded = true,
  interactive,
  tone = "surface",
}: CardProps) {
  const base = `rounded-[12px] border ${TONES[tone]} ${padded ? "p-5 sm:p-6" : ""}`;
  const hover = interactive
    ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-ring hover:shadow-[0_2px_6px_rgba(15,44,82,0.06),0_20px_44px_-20px_rgba(15,44,82,0.24)]"
    : tone === "navy"
      ? "transition-colors hover:bg-navy-soft"
      : "transition-colors hover:border-navy-muted";

  if (href) {
    return (
      <Link href={href} className={`${base} block ${hover} ${className}`}>
        {children}
      </Link>
    );
  }

  return <div className={`${base} ${interactive ? hover : ""} ${className}`}>{children}</div>;
}
