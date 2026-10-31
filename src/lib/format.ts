import { shop } from "@/shop.config";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export const money = (n: number) => shop.currency + inr.format(n);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function discountPercent(price: number, mrp: number) {
  return mrp > price && price > 0 ? Math.round((1 - price / mrp) * 100) : 0;
}

export function whatsappLink(text: string) {
  return `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export const productPath = (id: string) => `/product/${encodeURIComponent(id.toLowerCase())}`;
export const categoryPath = (category: string) => `/category/${slugify(category)}`;
