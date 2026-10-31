import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { shop } from "@/shop.config";
import { getCatalogue, getCategories } from "@/lib/products";
import { CategoryIcon } from "@/lib/category-icon";
import { Catalogue } from "@/components/catalogue";
import { ProductGridSkeleton } from "@/components/product-card";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} in ${shop.city}`,
    description: `Shop ${category.count} ${category.name.toLowerCase()} at ${shop.name}, ${shop.city}. Order on WhatsApp for local delivery.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

/** Everything that depends on the URL lives here, inside the page's Suspense boundary. */
async function CategoryContent({ params }: Pick<PageProps<"/category/[slug]">, "params">) {
  const { slug } = await params;
  const [products, categories] = await Promise.all([getCatalogue(), getCategories()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{category.name}</span>
      </nav>
      <div className="mt-4 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
          <CategoryIcon category={category.name} className="size-7" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{category.name}</h1>
          <p className="text-muted-foreground">
            {category.count} product{category.count === 1 ? "" : "s"} · order on WhatsApp
          </p>
        </div>
      </div>
      <Catalogue products={products} categories={categories} activeSlug={slug} />
    </>
  );
}

export default function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6">
      <Suspense
        fallback={
          <>
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-14 w-72 animate-pulse rounded-2xl bg-muted" />
            <div className="mt-24">
              <ProductGridSkeleton />
            </div>
          </>
        }
      >
        <CategoryContent params={params} />
      </Suspense>
    </div>
  );
}
