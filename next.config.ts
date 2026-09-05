import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
