interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  /** Trailing words rendered in the accent colour, as in "Our Compliance." */
  accentTitle?: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Short orange rule beneath a centred title. */
  rule?: boolean;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  accentTitle,
  description,
  align = "left",
  tone = "light",
  rule,
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const isDark = tone === "dark";

  return (
    <div className={`${isCenter ? "mx-auto max-w-2xl text-center" : "max-w-3xl"} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}

      <h2
        className={`display-lg ${eyebrow ? "mt-3" : ""} ${isDark ? "text-white" : ""} ${
          rule && isCenter ? "title-rule" : ""
        }`}
      >
        {title}
        {accentTitle ? <span className="display-accent"> {accentTitle}</span> : null}
      </h2>

      {description ? (
        <p
          className={`mt-4 text-[15px] leading-relaxed sm:text-base ${
            isDark ? "text-white/70" : "text-ink-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
