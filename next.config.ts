import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "vvgxwlnxyhtxvariqnba.supabase.co",
      },
    ],
  },
};

export default nextConfig;
