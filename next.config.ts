import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The homepage share card reads its background off disk at generation time.
  // Files under public/ are served statically but are not traced into a
  // function's bundle, so it has to be named explicitly or the card renders
  // without its photograph.
  outputFileTracingIncludes: {
    "/site/[tenant]/(public)/opengraph-image": ["./public/brand/og-hero.jpg"],
  },
  images: {
    // Only ever true for static, locally-bundled SVGs we sourced ourselves
    // (developer partner logos) — never for user-supplied or remote SVGs.
    // Next's own recommended-safe combination: sandboxed + no inline scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
