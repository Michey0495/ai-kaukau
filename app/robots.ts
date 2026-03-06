import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/mcp"],
        disallow: ["/api/generate", "/api/buy", "/api/like", "/api/feed"],
      },
    ],
    sitemap: "https://ai-kaukau.ezoai.jp/sitemap.xml",
  };
}
