import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["crypto"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "assets.vercel.com" },
    ],
  },
};

export default nextConfig;
