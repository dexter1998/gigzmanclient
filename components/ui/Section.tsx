interface SectionProps {
  children: React.ReactNode;
  className?: string;
  tone?: "page" | "tint" | "tint-deep" | "navy" | "accent";
  size?: "sm" | "md" | "lg";
  id?: string;
  wide?: boolean;
}

const TONES: Record<string, string> = {
  page: "bg-page text-ink",
  tint: "bg-tint text-ink",
  "tint-deep": "bg-tint-deep text-ink",
  navy: "bg-navy text-white",
  accent: "bg-accent-soft text-ink",
};

const SIZES: Record<string, string> = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-18",
  lg: "py-16 sm:py-24",
};

export default function Section({
  children,
  className = "",
  tone = "page",
  size = "md",
  id,
  wide,
}: SectionProps) {
  return (
    <section id={id} className={`${TONES[tone]} ${SIZES[size]} ${className}`}>
      <div className={`mx-auto w-full px-5 sm:px-6 lg:px-8 ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
        {children}
      </div>
    </section>
  );
}
