import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
  output: "standalone",

  // Image optimization (use Cloudflare Images or disable)
  images: {
    unoptimized: true,
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Ignore ESLint errors during build (pre-existing issues)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
