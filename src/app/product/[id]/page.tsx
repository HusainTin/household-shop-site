import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, MessageCircle, Truck, Wallet } from "lucide-react";
import { shop, siteUrl } from "@/shop.config";
import { getCatalogue, getProduct } from "@/lib/products";
import { categoryPath, money, productPath, whatsappLink } from "@/lib/format";
import { imageSources } from "@/lib/images";
import { AddToBasket } from "@/components/add-to-basket";
import { Gallery } from "@/components/gallery";
import { SectionHeading } from "@/components/home-sections";
import { Price, ProductGrid } from "@/components/product-card";
import { ShareButton } from "@/components/share-button";
import { JsonLd } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Every product page is fully pre-built: fast for visitors, complete HTML for Google
// and WhatsApp link previews. New sheet rows are built on their first visit.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getCatalogue()).map((p) => ({ id: p.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: "Product not found" };

  const title = `${p.name}${p.unit ? ` (${p.unit})` : ""}`;
  const description =
    `${p.brand ? `${p.brand} ` : ""}${p.name} — ${p.price ? money(p.price) : "ask for price"}` +
    `${p.inStock ? "" : " (out of stock)"}. ${p.description || `Order on WhatsApp from ${shop.name}, ${shop.city}.`}`;
  const image = imageSources(p.images[0], 1200)[0];

  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: productPath(p.id) },
    openGraph: { title, description, url: productPath(p.id), images: image ? [{ url: image, alt: p.name }] : undefined },
  };
}

/** Everything that depends on the URL lives here, inside the page's Suspense boundary. */
async function ProductContent({ params }: Pick<PageProps<"/product/[id]">, "params">) {
  const { id } = await params;
  const [p, catalogue] = await Promise.all([getProduct(id), getCatalogue()]);
  if (!p) notFound();
  const related = catalogue.filter((x) => x.categorySlug === p.categorySlug && x.id !== p.id && x.inStock).slice(0, 5);
  const enquiry = `Hello ${shop.name}, I'm interested in: ${p.name}${p.unit ? ` (${p.unit})` : ""} — ${
    p.price ? money(p.price) : "price?"
  }\n${siteUrl}${productPath(p.id)}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          sku: p.id,
          description: p.description || undefined,
          brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
          category: p.category,
          image: p.images.map((src) => imageSources(src, 1200)[0]).filter(Boolean),
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "INR",
            availability: `https://schema.org/${p.inStock ? "InStock" : "OutOfStock"}`,
            url: `${siteUrl}${productPath(p.id)}`,
          },
        }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={categoryPath(p.category)} className="hover:text-foreground">
          {p.category}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{p.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 md:grid-cols-2 lg:gap-14">
        <Gallery images={p.images} name={p.name} category={p.category} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {p.brand && <Badge variant="secondary">{p.brand}</Badge>}
            {p.featured && <Badge variant="highlight">Best seller</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{p.name}</h1>
          {p.unit && <p className="mt-1.5 text-lg text-muted-foreground">{p.unit}</p>}

          <div className="mt-5">
            <Price p={p} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
          </div>

          <p className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${p.inStock ? "text-success" : "text-offer"}`}>
            <span className={`size-2 rounded-full ${p.inStock ? "bg-success" : "bg-offer"}`} />
            {p.inStock ? "In stock" : "Out of stock. Message us and we'll tell you when it's back."}
          </p>

          <div className="mt-6 grid max-w-md gap-3">
            <AddToBasket id={p.id} name={p.name} inStock={p.inStock} size="xl" />
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Button asChild variant="whatsapp" size="xl">
                <a href={whatsappLink(enquiry)} target="_blank" rel="noopener">
                  <MessageCircle /> {p.inStock ? "Ask on WhatsApp" : "Notify me"}
                </a>
              </Button>
              <ShareButton title={p.name} path={productPath(p.id)} />
            </div>
          </div>

          <ul className="mt-6 grid max-w-md gap-3 rounded-2xl border bg-card p-4 text-sm shadow-soft">
            <li className="flex gap-3">
              <Truck className="mt-0.5 size-5 shrink-0 text-primary" /> {shop.deliveryNote}
            </li>
            <li className="flex gap-3">
              <Wallet className="mt-0.5 size-5 shrink-0 text-primary" /> {shop.paymentNote}
            </li>
          </ul>

          {p.description && (
            <>
              <Separator className="my-6" />
              <h2 className="text-lg font-bold">About this product</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{p.description}</p>
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={`More in ${p.category}`} />
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <>
      <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-5 grid gap-8 md:grid-cols-2 lg:gap-14">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-4/5 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 max-w-md animate-pulse rounded-xl bg-muted" />
          <div className="h-12 max-w-md animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </>
  );
}

export default function ProductPage({ params }: PageProps<"/product/[id]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}
