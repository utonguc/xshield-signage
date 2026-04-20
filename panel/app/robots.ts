import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: ["/dashboard", "/devices", "/playlists", "/content", "/schedules"],
      },
    ],
    sitemap: "https://signage.xshield.com.tr/sitemap.xml",
  };
}
