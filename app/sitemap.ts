import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://instabarber.pt/", changeFrequency: "weekly", priority: 1 }];
}
