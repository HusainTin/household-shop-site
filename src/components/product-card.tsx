import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/products";
import { discountPercent, money, productPath } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AddToBasket } from "./add-to-basket";
import { ProductImage } from "./product-image";

export function Price({ p, size = "md" }: { p: Product; size?: "md" | "lg" }) {
  const off = discountPercent(p.price, p.mrp);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={cn("font-bold tabular-nums", size === "lg" ? "text-3xl" : "text-lg")}>
        {p.price ? money(p.price) : "Ask for price"}
      </span>
      {off > 0 && (
        <>
          <s className={cn("text-muted-foreground tabular-nums", size === "lg" ? "text-base" : "text-sm")}>{money(p.mrp)}</s>
          {size === "lg" && <span className="text-sm font-semibold text-success">You save {money(p.mrp - p.price)}</span>}
        </>
      )}
    </div>
  );
}

export function ProductCard({ p, eager = false }: { p: Product; eager?: boolean }) {
  const off = discountPercent(p.price, p.mrp);
  const href = productPath(p.id);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={href} className="relative block aspect-square" aria-label={p.name}>
        <ProductImage src={p.images[0]} name={p.name} category={p.category} width={400} eager={eager} zoomOnHover />
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {!p.inStock ? (
            <Badge variant="dark">Out of stock</Badge>
          ) : (
            <>
              {off >= 5 && <Badge variant="offer">{off}% off</Badge>}
              {p.featured && <Badge variant="highlight">Best seller</Badge>}
            </>
          )}
        </div>
        {!p.inStock && <div className="absolute inset-0 bg-background/40" aria-hidden />}
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        {p.brand && <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">{p.brand}</p>}
        <h3 className="mt-0.5 line-clamp-2 text-[0.95rem] font-semibold leading-snug">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.name}
          </Link>
        </h3>
        {p.unit && <p className="mt-0.5 text-sm text-muted-foreground">{p.unit}</p>}
        <div className="mt-auto pt-3">
          <Price p={p} />
        </div>
        {/* Sits above the stretched link so the button stays clickable. */}
        <div className="relative z-10 mt-3">
          <AddToBasket id={p.id} name={p.name} inStock={p.inStock} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, eagerCount = 0 }: { products: Product[]; eagerCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} p={p} eager={i < eagerCount} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-3.5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
