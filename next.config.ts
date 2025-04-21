import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ 
  devIndicators: false,
    // existing config...
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    reactStrictMode: false, // Optional: can help during debugging hydration
    // 👇 disable React's error overlay in production
    productionBrowserSourceMaps: false,
  }
export default nextConfig;
