import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  ShoppingBasket,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon, categoryHue } from "@/lib/category-icon";
import { categoryPath, whatsappLink } from "@/lib/format";
import type { Category } from "@/lib/products";
import { shop } from "@/shop.config";

const highlightIcons: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  wallet: Wallet,
  chat: MessageCircle,
};

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 30rem at 85% -10%, color-mix(in oklch, var(--brand) 16%, transparent), transparent 70%), radial-gradient(40rem 24rem at -10% 110%, color-mix(in oklch, var(--highlight) 30%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-secondary-foreground shadow-soft">
            <MapPin className="size-3.5 text-primary" /> Serving {shop.city}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Everyday essentials, <span className="text-primary">delivered to your door.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{shop.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="xl">
              <a href="#products">
                <ShoppingBasket /> Shop now
              </a>
            </Button>
            <Button asChild size="xl" variant="outline" className="bg-card">
              <a href={whatsappLink(`Hello ${shop.name}, `)} target="_blank" rel="noopener">
                <MessageCircle className="text-whatsapp" /> Chat with us
              </a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {shop.heroPoints.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <ChatPreview />
      </div>
    </section>
  );
}

/** Illustration of how ordering works: a WhatsApp-style conversation. */
function ChatPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm md:mr-0">
      <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2rem] bg-primary/10" />
      <div className="overflow-hidden rounded-[1.75rem] border bg-card shadow-lift">
        <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
          <span className="grid size-9 place-items-center rounded-full bg-white/20 font-bold">{shop.name[0]}</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{shop.name}</p>
            <p className="text-xs opacity-80">usually replies in minutes</p>
          </div>
        </div>
        <div className="space-y-3 bg-[oklch(0.96_0.012_95)] p-4 text-[0.8rem] leading-relaxed">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[oklch(0.93_0.06_150)] px-3.5 py-2.5 shadow-soft">
            <p className="font-semibold">I&apos;d like to place an order:</p>
            <p>1. Steel Water Bottle 1 L × 2</p>
            <p>2. 3-Tier Steel Tiffin × 1</p>
            <p className="mt-1 font-semibold">Total: ₹1,847</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-[0.65rem] text-muted-foreground">
              10:42 <CheckCheck className="size-3.5 text-sky-500" />
            </p>
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 shadow-soft">
            <p>Thank you! Your order is confirmed ✅</p>
            <p>We&apos;ll deliver by 6 pm today. Pay by cash or UPI on delivery.</p>
            <p className="mt-0.5 text-right text-[0.65rem] text-muted-foreground">10:44</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Highlights() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {shop.highlights.map((h) => {
          const Icon = highlightIcons[h.icon] ?? Check;
          return (
            <li key={h.title} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{h.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{h.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((c) => {
        const hue = categoryHue(c.name);
        return (
          <Link
            key={c.slug}
            href={categoryPath(c.name)}
            className="group flex flex-col justify-between gap-6 rounded-2xl border p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            style={{ background: `linear-gradient(160deg, oklch(0.975 0.02 ${hue}), oklch(0.94 0.04 ${hue}))` }}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/80 shadow-soft">
              <CategoryIcon category={c.name} className="size-6" style={{ color: `oklch(0.45 0.09 ${hue})` }} />
            </span>
            <span>
              <span className="block font-semibold leading-snug">{c.name}</span>
              <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                {c.count} item{c.count === 1 ? "" : "s"}
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function CategoryTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export function HowToOrder() {
  const steps = [
    { icon: ShoppingBasket, title: "Add to basket", text: "Browse and add what you need. No account needed." },
    { icon: MessageCircle, title: "Send on WhatsApp", text: "Your order is written for you. Just tap send." },
    { icon: Truck, title: "We deliver", text: "We confirm, pack and bring it to your door." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading title="How ordering works" subtitle="Three steps, about a minute." />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <span className="absolute right-5 top-4 font-heading text-5xl font-extrabold text-muted">{i + 1}</span>
            <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
              <s.icon className="size-6" />
            </span>
            <p className="mt-4 text-lg font-semibold">{s.title}</p>
            <p className="mt-1 text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VisitUs() {
  const tel = `tel:${shop.phone.replace(/[^\d+]/g, "")}`;
  const rows = [
    { icon: MapPin, label: "Address", value: shop.address },
    { icon: Clock, label: "Opening hours", value: shop.timings },
    { icon: Phone, label: "Phone", value: <a href={tel} className="font-medium text-primary hover:underline">{shop.phone}</a> },
  ];
  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 pb-4 pt-6">
      <div className="grid overflow-hidden rounded-3xl border bg-card shadow-soft md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Visit the shop</h2>
          <p className="mt-2 text-muted-foreground">Prefer to see products in person? Drop in. We&apos;re happy to help.</p>
          <dl className="mt-6 space-y-4">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <r.icon className="size-5" />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.label}</dt>
                  <dd className="mt-0.5">{r.value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="whatsapp" size="xl">
              <a href={whatsappLink(`Hello ${shop.name}, `)} target="_blank" rel="noopener">
                <MessageCircle /> Message us
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`} target="_blank" rel="noopener">
                <Navigation /> Directions
              </a>
            </Button>
          </div>
        </div>
        {shop.mapEmbedUrl ? (
          <iframe src={shop.mapEmbedUrl} title="Shop location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0 md:h-full" />
        ) : (
          <div
            className="relative hidden min-h-72 items-center justify-center md:flex"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--brand) 12%, white), color-mix(in oklch, var(--brand) 28%, white))",
            }}
          >
            <div className="grid size-20 place-items-center rounded-full bg-card shadow-lift">
              <MapPin className="size-9 text-primary" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
