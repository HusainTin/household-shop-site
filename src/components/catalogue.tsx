"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Product } from "@/lib/products";
import { categoryPath, discountPercent, whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductGrid } from "./product-card";

type Props = {
  products: Product[];
  categories: Category[];
  /** Category slug being viewed, or null for the home page (all products). */
  activeSlug: string | null;
};

const SORTS = {
  popular: { label: "Popular", fn: (a: Product, b: Product) => Number(b.featured) - Number(a.featured) },
  "price-asc": { label: "Price: low to high", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a: Product, b: Product) => b.price - a.price },
  discount: {
    label: "Biggest discount",
    fn: (a: Product, b: Product) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp),
  },
} as const;
type SortKey = keyof typeof SORTS;

function matches(p: Product, words: string[]) {
  const haystack = `${p.name} ${p.brand} ${p.category} ${p.unit} ${p.description} ${p.id}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

export function Catalogue({ products, categories, activeSlug }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;

  // Searching always looks across every product, whichever category is open.
  const filtered = searching
    ? products.filter((p) => matches(p, words))
    : activeSlug
      ? products.filter((p) => p.categorySlug === activeSlug)
      : products;
  // In-stock items first, then the chosen order (sort is stable, so sheet order breaks ties).
  const list = [...filtered].sort((a, b) => Number(b.inStock) - Number(a.inStock) || SORTS[sort].fn(a, b));
  const activeName = categories.find((c) => c.slug === activeSlug)?.name;

  return (
    <div id="products">
      <div className="sticky top-16 z-20 -mx-4 border-b border-transparent bg-background/85 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bottles, tiffins, brands…"
              aria-label="Search products"
              className="h-11 rounded-xl bg-card pl-10 pr-10 text-base shadow-soft md:text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <label className="relative hidden sm:block">
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 appearance-none rounded-xl border border-input bg-card pl-3.5 pr-9 text-sm font-medium shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 fill-none stroke-muted-foreground stroke-2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>
        </div>

        <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          <CategoryPill href="/#products" active={!activeSlug && !searching}>
            All
          </CategoryPill>
          {categories.map((c) => (
            <CategoryPill key={c.slug} href={categoryPath(c.name)} active={c.slug === activeSlug && !searching}>
              {c.name}
              <span className="ml-1.5 text-xs opacity-60 tabular-nums">{c.count}</span>
            </CategoryPill>
          ))}
        </nav>
      </div>

      <div className="mb-4 mt-6 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">
          {searching ? (
            <>
              {list.length} result{list.length === 1 ? "" : "s"} for “{query.trim()}”
            </>
          ) : (
            (activeName ?? "All products")
          )}
        </h2>
        {!searching && <p className="shrink-0 text-sm text-muted-foreground tabular-nums">{list.length} items</p>}
      </div>

      {list.length ? (
        <ProductGrid products={list} eagerCount={4} />
      ) : (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <p className="text-lg font-semibold">No products found</p>
          <p className="mt-1 text-muted-foreground">We may still have it in the shop. Ask us and we&apos;ll check.</p>
          <Button asChild variant="whatsapp" size="xl" className="mt-5">
            <a href={whatsappLink(`Hello, I'm looking for: ${query.trim()}`)} target="_blank" rel="noopener">
              <MessageCircle /> Ask on WhatsApp
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

function CategoryPill({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 flex-none items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:border-foreground/30 hover:bg-accent",
      )}
    >
      {children}
    </Link>
  );
}
