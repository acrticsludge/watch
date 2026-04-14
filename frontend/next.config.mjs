import { createMDX } from 'fumadocs-mdx/next';

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://us.i.posthog.com",
      "connect-src 'self' https://hwguskfwofbivhcrfjmt.supabase.co https://clarity.microsoft.com https://www.google-analytics.com https://us.i.posthog.com https://app.posthog.com",
      "img-src 'self' data: https://avatars.githubusercontent.com",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["crypto"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "assets.vercel.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default createMDX()(nextConfig);
