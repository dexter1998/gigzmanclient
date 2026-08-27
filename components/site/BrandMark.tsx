interface BrandMarkProps {
  className?: string;
  /** Firm-supplied artwork. Falls back to the built-in mark when unset. */
  src?: string | null;
  alt?: string;
  /** Renders the "INDIA" wordmark beneath the letterforms (fallback mark only). */
  withWordmark?: boolean;
  /** Inverts the letterforms for placement on the navy footer (fallback mark only). */
  onDark?: boolean;
}

/**
 * Renders the firm's own logo when one is configured, otherwise a built-in
 * placeholder drawn inline so it stays crisp at any size.
 *
 * To use real artwork: drop the file in `public/brand/` and set the path on the
 * firm's settings — nothing else needs to change.
 */
export default function BrandMark({
  className = "h-10 w-10",
  src,
  alt = "",
  withWordmark = false,
  onDark = false,
}: BrandMarkProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- the logo is a fixed
    // small asset and the intrinsic size varies per client, so optimisation and
    // layout-shift handling are not worth a required width/height contract here.
    return <img src={src} alt={alt} className={`${className} object-contain`} />;
  }

  const letter = onDark ? "#ffffff" : "#1c5480";

  return (
    <svg
      viewBox={withWordmark ? "0 0 250 250" : "0 0 250 185"}
      role="img"
      aria-label={alt || "Chartered accountancy practice"}
      className={className}
      fill="none"
    >
      <path
        d="M139 62A54 54 0 1 0 139 138"
        stroke={letter}
        strokeWidth="19"
        strokeLinecap="round"
      />
      <path d="M143 158 184 52" stroke={letter} strokeWidth="8" strokeLinecap="round" />
      <path
        d="M186 52 224 158"
        stroke={letter}
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M167 106 200 106" stroke={letter} strokeWidth="7" strokeLinecap="round" />
      <path d="M112 128C150 126 196 108 244 76 208 112 156 142 118 148Z" fill="#f0812b" />
      <path d="M128 150C166 148 208 130 250 102 216 136 168 166 134 170Z" fill="#4caf50" />

      {withWordmark ? (
        <text
          x="125"
          y="228"
          textAnchor="middle"
          fill={letter}
          fontSize="46"
          fontWeight="500"
          letterSpacing="12"
          fontFamily="var(--font-sans)"
        >
          INDIA
        </text>
      ) : null}
    </svg>
  );
}
