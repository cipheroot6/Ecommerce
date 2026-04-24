import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
    ]
  },
};

export default nextConfig;
