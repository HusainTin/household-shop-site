import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { shop, siteUrl } from "@/shop.config";
import { getCatalogue, getCategories } from "@/lib/products";
import { Catalogue } from "@/components/catalogue";
import {
  CategoryTiles,
  CategoryTilesSkeleton,
  Hero,
  Highlights,
  HowToOrder,
  SectionHeading,
  VisitUs,
} from "@/components/home-sections";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { JsonLd } from "@/components/site-chrome";

export const ensureStatic = "navigation";

async function Categories() {
  return <CategoryTiles categories={await getCategories()} />;
}

async function BestSellers() {
  const featured = (await getCatalogue()).filter((p) => p.featured && p.inStock).slice(0, 10);
  if (!featured.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeading
        title="Best sellers"
        subtitle="What our neighbours buy most"
        action={
          <Link href="#products" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
            See all <ArrowRight className="size-4" />
          </Link>
        }
      />
      <ProductGrid products={featured} eagerCount={5} />
    </section>
  );
}

async function AllProducts() {
  const [products, categories] = await Promise.all([getCatalogue(), getCategories()]);
  return <Catalogue products={products} categories={categories} activeSlug={null} />;
}

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: shop.name,
          description: shop.description,
          url: siteUrl,
          telephone: shop.phone,
          address: shop.address,
          openingHours: shop.timings,
        }}
      />
      <Hero />
      <Highlights />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeading title="Shop by category" />
        <Suspense fallback={<CategoryTilesSkeleton />}>
          <Categories />
        </Suspense>
      </section>

      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><ProductGridSkeleton count={5} /></div>}>
        <BestSellers />
      </Suspense>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <AllProducts />
        </Suspense>
      </section>

      <HowToOrder />
      <VisitUs />
    </>
  );
}
