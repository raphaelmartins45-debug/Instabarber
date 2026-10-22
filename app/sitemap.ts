import type { MetadataRoute } from "next";

// A data da última publicação ajuda o Google a saber quando voltar (D-105).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://instabarber.pt/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
