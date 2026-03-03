import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://ai-kaukau.ezoai.jp";
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/catalog`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
  ];
}
