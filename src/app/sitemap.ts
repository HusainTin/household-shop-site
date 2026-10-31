import type { MetadataRoute } from "next";
import { siteUrl } from "@/shop.config";
import { getCatalogue, getCategories } from "@/lib/products";
import { productPath } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getCatalogue(), getCategories()]);
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({ url: `${siteUrl}/category/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${siteUrl}${productPath(p.id)}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
