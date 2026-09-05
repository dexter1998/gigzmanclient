import type { ReactNode } from "react";
import { NoiseTextureV2 } from "./NoiseTextureV2";

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

type GpSectionTone = "cream" | "forest" | "transparent";

const TONE_CLASS: Record<GpSectionTone, string> = {
  cream: "bg-tint",
  forest: "bg-[image:var(--gp-gradient-dark-section)] text-white",
  transparent: "",
};

export function GpContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("gp-container", className)}>{children}</div>;
}

export function GpSection({
  children,
  className,
  tone = "transparent",
  id,
  background,
}: {
  children: ReactNode;
  className?: string;
  tone?: GpSectionTone;
  id?: string;
  /**
   * Full-bleed content (a background `<Image fill>`, a gradient overlay)
   * rendered as a sibling of the content wrapper below, not inside it — the
   * content wrapper only ever sizes to its own text/form content, so an
   * `<Image fill>` placed inside it previously only covered that content's
   * height, leaving `.gp-section`'s own vertical padding as a plain strip
   * above and below the photo. This renders at the same level as the noise
   * texture, so it covers the section's full padded bounds instead.
   */
  background?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("gp-section relative overflow-hidden", TONE_CLASS[tone], className)}
    >
      {background}
      {/* A flat-color section with no photography reads as slightly cheap
          on its own — this faint grain gives cream/forest backgrounds the
          same tactile quality as the photo-led sections next to them. */}
      {tone !== "transparent" ? (
        <NoiseTextureV2
          tint={tone === "forest" ? "green" : "beige"}
          noiseOpacity={tone === "forest" ? 0.75 : 0.55}
          slope={tone === "forest" ? 0.22 : 0.15}
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}

export function GpEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("gp-eyebrow text-[color:var(--gp-gold-600)]", className)}>{children}</p>;
}
