"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "./gp-primitives";

export interface NoiseTextureProps extends ComponentProps<"svg"> {
  className?: string;
  /** `baseFrequency` for `feTurbulence`; higher values yield finer-grained noise. */
  frequency?: number;
  /** `numOctaves` for `feTurbulence`; more octaves add detail at smaller scales. */
  octaves?: number;
  /** Linear slope on each channel after desaturation; adjusts contrast of the noise. */
  slope?: number;
  /** Opacity of the filled noise layer (`rect`). */
  noiseOpacity?: number;
  /**
   * feTurbulence only ever produces grayscale-after-desaturation noise, which
   * has no hue for a CSS `hue-rotate` to act on — `sepia` first introduces a
   * tint for `hue-rotate`/`saturate` to then push toward beige or green.
   */
  tint?: "beige" | "green";
}

const TINT_FILTER: Record<NonNullable<NoiseTextureProps["tint"]>, string> = {
  beige: "sepia(0.6) saturate(1.4) brightness(1.05)",
  // hue-rotate(65deg) landed the grain on a yellow-green that read as plain
  // "green" against the brand's teal-leaning forest (#0F3D3A, hue ~174°) —
  // a wider rotation plus less saturation keeps the grain from overpowering
  // the teal it's layered on top of.
  green: "sepia(1) hue-rotate(150deg) saturate(1.5) brightness(0.92)",
};

export function NoiseTextureV2({
  className,
  frequency = 0.4,
  octaves = 6,
  slope = 0.15,
  noiseOpacity = 0.6,
  tint,
  style,
  ...props
}: NoiseTextureProps) {
  const filterId = useId();

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 z-0 size-full opacity-50 select-none",
        className,
      )}
      style={tint ? { filter: TINT_FILTER[tint], ...style } : style}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency={frequency}
          numOctaves={octaves}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={slope} />
          <feFuncG type="linear" slope={slope} />
          <feFuncB type="linear" slope={slope} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} opacity={noiseOpacity} />
    </svg>
  );
}
