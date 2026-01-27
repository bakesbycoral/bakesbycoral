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
};

export default nextConfig;
