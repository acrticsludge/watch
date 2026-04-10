import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

  return [
    {
      url: base,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${base}/pricing`,
      lastModified: "2026-03-26",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/faq`,
      lastModified: "2026-03-26",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: "2026-03-16",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: "2026-03-16",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];
}
