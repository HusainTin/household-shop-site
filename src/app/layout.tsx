import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense, type CSSProperties } from "react";
import { shop, siteUrl } from "@/shop.config";
import { getCatalogue } from "@/lib/products";
import { BasketSheet, MobileBasketBar, type BasketProduct } from "@/components/basket-sheet";
import { WhatsAppFloat } from "@/components/header-basket-button";
import { AnnouncementBar, Footer, Header } from "@/components/site-chrome";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${shop.name} — ${shop.city}`, template: `%s | ${shop.name}` },
  description: shop.description,
  openGraph: { type: "website", siteName: shop.name, locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: shop.brandColour };

/** Basket UI needs the product list (for names and prices); it streams in after the page shell. */
async function Basket() {
  const products: BasketProduct[] = (await getCatalogue()).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit,
    image: p.images[0],
    category: p.category,
  }));
  return (
    <>
      <BasketSheet products={products} />
      <MobileBasketBar products={products} />
    </>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={jakarta.variable} style={{ "--brand": shop.brandColour } as CSSProperties}>
      <body className="flex min-h-dvh flex-col font-sans">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Suspense>
          <Footer />
        </Suspense>
        <WhatsAppFloat />
        <Suspense>
          <Basket />
        </Suspense>
        <Toaster position="top-center" richColors={false} closeButton />
      </body>
    </html>
  );
}
