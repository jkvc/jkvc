import type { MetadataRoute } from "next";
import { SITE } from "./lib/site";
import { projects } from "./projects/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((p) => p.ready)
    .map((p) => ({
      url: `${SITE.url}/projects/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...projectRoutes];
}
