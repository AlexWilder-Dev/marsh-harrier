import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marshharriercowley.co.uk";
  const now = new Date();
  return [
    { url: base,              lastModified: now, changeFrequency: "weekly",  priority: 1   },
    { url: `${base}/rooms`,   lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/order`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
