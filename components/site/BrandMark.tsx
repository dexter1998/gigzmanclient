interface BrandMarkProps {
  className?: string;
  /** Firm-supplied artwork. Falls back to the built-in mark when unset. */
  src?: string | null;
  alt?: string;
  /** Renders the wordmark beneath the letterforms (fallback mark only). */
  withWordmark?: boolean;
  /** Inverts the letterforms for placement on the navy/green footer (fallback mark only). */
  onDark?: boolean;
  /**
   * Which built-in fallback to draw when no artwork is supplied. Defaults to
   * the CA letterform mark rather than throwing, so any call site that
   * predates this prop (there were several before the real-estate vertical
   * existed) keeps rendering exactly as it did.
   */
  vertical?: "cafirm" | "realestate";
}

/**
 * Renders the firm's own logo when one is configured, otherwise a built-in
 * placeholder drawn inline so it stays crisp at any size.
 *
 * To use real artwork: drop the file in `public/brand/` and set the path on the
 * firm's settings — nothing else needs to change. The fallback mark is
 * per-vertical original work — a real-estate tenant must never fall back to
 * the CA letterform (and vice versa).
 */
export default function BrandMark({
  className = "h-10 w-10",
  src,
  alt = "",
  withWordmark = false,
  onDark = false,
  vertical = "cafirm",
}: BrandMarkProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- the logo is a fixed
    // small asset and the intrinsic size varies per client, so optimisation and
    // layout-shift handling are not worth a required width/height contract here.
    return <img src={src} alt={alt} className={`${className} object-contain`} />;
  }

  if (vertical === "realestate") {
    return <RealEstateMark className={className} alt={alt} withWordmark={withWordmark} onDark={onDark} />;
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

/**
 * Original fallback mark for the real-estate vertical — a simple skyline/
 * gate glyph, not sourced from any downloaded asset kit (the approved kit's
 * own brand-mark placeholder was explicitly excluded; see
 * public/verticals/realestate/photos/README.md). Colored to Geeta
 * Properties' actual navy/gold brand rather than the CA mark's navy/orange/
 * green. If a real logo file (not just a chat-pasted image) is dropped into
 * public/brand/ and set on a client's settings.logoUrl, that always wins —
 * this fallback only renders when no logo is configured.
 */
function RealEstateMark({
  className,
  alt,
  withWordmark,
  onDark,
}: {
  className?: string;
  alt: string;
  withWordmark: boolean;
  onDark: boolean;
}) {
  const line = onDark ? "#ffffff" : "#1b2436";
  const gold = "#c79b45";

  return (
    <svg
      viewBox={withWordmark ? "0 0 250 250" : "0 0 250 185"}
      role="img"
      aria-label={alt || "Real estate agency"}
      className={className}
      fill="none"
    >
      {/* Three buildings forming a simple skyline, with a gold roofline accent. */}
      <path d="M40 158V90h34v68" stroke={line} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M98 158V48h54v110" stroke={line} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M176 158V76h34v82" stroke={line} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 158H222" stroke={line} strokeWidth="12" strokeLinecap="round" />
      <path d="M98 48 125 24 152 48" stroke={gold} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M115 158V118H135V158" stroke={onDark ? "#0f2a1e" : "#f5efe1"} strokeWidth="6" />

      {withWordmark ? (
        <text
          x="125"
          y="205"
          textAnchor="middle"
          fill={line}
          fontSize="30"
          fontWeight="500"
          letterSpacing="8"
          fontFamily="var(--font-sans)"
        >
          PROPERTIES
        </text>
      ) : null}
    </svg>
  );
}
