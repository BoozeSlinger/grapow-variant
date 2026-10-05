import type { MetadataRoute } from "next";
import { VENUE } from "@/data/venue";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
    sitemap: `${VENUE.siteUrl}/sitemap.xml`,
  };
}
