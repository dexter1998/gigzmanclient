interface SectionProps {
  children: React.ReactNode;
  className?: string;
  tone?: "cream" | "white" | "navy" | "accent";
  size?: "sm" | "md" | "lg";
  id?: string;
}

const TONES: Record<string, string> = {
  cream: "bg-cream text-ink",
  white: "bg-surface text-ink",
  navy: "bg-navy text-white",
  accent: "bg-accent-soft text-ink",
};

const SIZES: Record<string, string> = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-20",
  lg: "py-16 sm:py-24",
};

export default function Section({
  children,
  className = "",
  tone = "cream",
  size = "md",
  id,
}: SectionProps) {
  return (
    <section id={id} className={`${TONES[tone]} ${SIZES[size]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
