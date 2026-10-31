import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryPath, whatsappLink } from "@/lib/format";
import { getCategories } from "@/lib/products";
import { shop } from "@/shop.config";
import { HeaderBasketButton } from "./header-basket-button";

const telHref = `tel:${shop.phone.replace(/[^\d+]/g, "")}`;

export function AnnouncementBar() {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-xs font-medium sm:text-sm">
        <Truck className="size-4 shrink-0 opacity-80" />
        <span className="truncate">{shop.deliveryNote}</span>
      </div>
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Store className="size-5" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-heading text-base font-extrabold tracking-tight">{shop.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{shop.city}</span>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" className="hidden h-10 px-3 md:inline-flex">
            <Link href="/#products">Products</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden h-10 px-3 md:inline-flex">
            <Link href="/#contact">Visit us</Link>
          </Button>
          <Button asChild variant="ghost" size="icon-xl" className="md:hidden" aria-label={`Call ${shop.phone}`}>
            <a href={telHref}>
              <Phone />
            </a>
          </Button>
          <Button asChild variant="outline" className="mr-1 hidden h-10 gap-2 rounded-xl px-3.5 md:inline-flex">
            <a href={telHref}>
              <Phone /> {shop.phone}
            </a>
          </Button>
          <HeaderBasketButton />
        </nav>
      </div>
    </header>
  );
}

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-16 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-5" />
            </span>
            <span className="font-heading text-lg font-extrabold">{shop.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-background/70">{shop.description}</p>
          <Button asChild variant="whatsapp" size="xl" className="mt-5">
            <a href={whatsappLink(`Hello ${shop.name}, `)} target="_blank" rel="noopener">
              <MessageCircle /> Chat on WhatsApp
            </a>
          </Button>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-background/60">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryPath(c.name)} className="text-background/85 hover:text-background">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-background/60">Visit</h2>
          <ul className="mt-3 space-y-3 text-sm text-background/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 opacity-70" /> {shop.address}
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 opacity-70" /> {shop.timings}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 opacity-70" />
              <a href={telHref} className="hover:text-background">
                {shop.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <p className="mx-auto max-w-7xl px-4 py-5 pb-24 text-xs text-background/60 md:pb-5">
          © {shop.name}. Prices include all taxes. Orders are confirmed on WhatsApp.
        </p>
      </div>
    </footer>
  );
}

/** Structured data for search engines. `<` is escaped so sheet text can't break out of the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
