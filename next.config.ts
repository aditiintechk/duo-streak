import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly use webpack for next-pwa compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // PWA service worker will be handled by next-pwa
    }
    return config;
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in both dev and production for testing
});

export default pwaConfig(nextConfig);
