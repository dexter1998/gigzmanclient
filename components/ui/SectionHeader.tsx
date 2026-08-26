interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const isDark = tone === "dark";

  return (
    <div
      className={`${isCenter ? "text-center mx-auto max-w-2xl" : "max-w-3xl"} ${className}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${isDark ? "text-accent" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`display-lg ${eyebrow ? "mt-3" : ""} ${isDark ? "text-white" : "text-ink"}`}
      >
        {title}
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
