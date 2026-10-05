import type { MetadataRoute } from "next";
import { SITE_ROUTES } from "@/data/nav";
import { VENUE } from "@/data/venue";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((route) => ({
    url: `${VENUE.siteUrl}${route === "/" ? "" : route}`,
    changeFrequency: route.startsWith("/menu") ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/menu") ? 0.8 : 0.6,
  }));
}
