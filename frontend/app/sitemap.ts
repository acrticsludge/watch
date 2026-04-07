import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

  return [
    {
      url: base,
      lastModified: "2026-03-26",
    },
    {
      url: `${base}/pricing`,
      lastModified: "2026-03-26",
    },
    {
      url: `${base}/faq`,
      lastModified: "2026-03-26",
    },
    {
      url: `${base}/privacy`,
      lastModified: "2026-03-16",
    },
    {
      url: `${base}/terms`,
      lastModified: "2026-03-16",
    },
  ];
}
