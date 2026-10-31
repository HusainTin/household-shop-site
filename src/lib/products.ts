import { cacheLife, cacheTag } from "next/cache";
import { sheetCsvUrl } from "@/shop.config";
import { parseCSV, rowsToRecords } from "./csv";
import { slugify } from "./format";
import { sampleRecords } from "./sample-products";

export type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  brand: string;
  price: number;
  mrp: number;
  unit: string;
  images: string[];
  description: string;
  inStock: boolean;
  featured: boolean;
};

export type Category = { name: string; slug: string; count: number };

export const CATALOGUE_TAG = "catalogue";

const isYes = (v = "") => /^(y|yes|true|1)$/i.test(v.trim());
const isNo = (v = "") => /^(n|no|false|0|out|out of stock)$/i.test(v.trim());
const toNumber = (v = "") => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function normalise(r: Record<string, string>, index: number): Product | null {
  const name = (r.name ?? "").trim();
  if (!name) return null;
  const category = (r.category ?? "").trim() || "Other";
  const images = [r.image, ...(r.more_images ?? "").split(/[\n,]+/)]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);
  return {
    id: (r.id ?? "").trim() || slugify(name) || `item-${index}`,
    name,
    category,
    categorySlug: slugify(category) || "other",
    brand: (r.brand ?? "").trim(),
    price: toNumber(r.price),
    mrp: toNumber(r.mrp),
    unit: (r.unit ?? "").trim(),
    images,
    description: (r.description ?? "").trim(),
    inStock: !isNo(r.in_stock),
    featured: isYes(r.featured),
  };
}

function toProducts(records: Record<string, string>[]): Product[] {
  const seen = new Set<string>();
  const products: Product[] = [];
  records.forEach((r, i) => {
    const p = normalise(r, i);
    if (!p) return;
    const key = p.id.toLowerCase();
    if (seen.has(key)) {
      console.warn(`[catalogue] Duplicate id "${p.id}" in sheet — keeping the first row only.`);
      return;
    }
    seen.add(key);
    products.push(p);
  });
  return products;
}

/**
 * The whole catalogue, cached and refreshed from the Google Sheet in the
 * background (see the "catalogue" profile in next.config.ts).
 */
export async function getCatalogue(): Promise<Product[]> {
  "use cache";
  cacheLife("catalogue");
  cacheTag(CATALOGUE_TAG);

  if (!sheetCsvUrl) return toProducts(sampleRecords);

  const res = await fetch(sheetCsvUrl);
  if (!res.ok) throw new Error(`Google Sheet request failed (${res.status})`);
  const text = await res.text();
  if (/^\s*</.test(text)) {
    throw new Error("Google Sheet returned HTML. Is it published to the web as CSV?");
  }
  return toProducts(rowsToRecords(parseCSV(text)));
}

export async function getProduct(id: string) {
  const key = decodeURIComponent(id).toLowerCase();
  return (await getCatalogue()).find((p) => p.id.toLowerCase() === key) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const map = new Map<string, Category>();
  for (const p of await getCatalogue()) {
    const c = map.get(p.categorySlug);
    if (c) c.count++;
    else map.set(p.categorySlug, { name: p.category, slug: p.categorySlug, count: 1 });
  }
  return [...map.values()];
}
