"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, ShoppingBasket, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { clearBasket, openBasket, setQuantity, useBasket } from "@/lib/basket-store";
import { money, productPath, whatsappLink } from "@/lib/format";
import { shop } from "@/shop.config";
import { QuantityStepper } from "./add-to-basket";
import { ProductImage } from "./product-image";

/** Just what the basket needs, so pages don't ship full product details twice. */
export type BasketProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  category: string;
};

type Line = { p: BasketProduct; qty: number };

const CUSTOMER_KEY = "customer:v1";

function useLines(products: BasketProduct[]) {
  const basket = useBasket();
  const byId = new Map(products.map((p) => [p.id, p]));
  // Items removed from the sheet simply drop out of the basket.
  const lines: Line[] = Object.entries(basket).flatMap(([id, qty]) => {
    const p = byId.get(id);
    return p && qty > 0 ? [{ p, qty }] : [];
  });
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    total: lines.reduce((n, l) => n + l.qty * l.p.price, 0),
  };
}

export function BasketSheet({ products }: { products: BasketProduct[] }) {
  const [open, setOpen] = useState(false);
  const { lines, count, total } = useLines(products);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("shop:open-basket", show);
    return () => window.removeEventListener("shop:open-basket", show);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBasket className="size-5 text-primary" />
            Your basket
            {count > 0 && <span className="font-normal text-muted-foreground">· {count} item{count === 1 ? "" : "s"}</span>}
          </SheetTitle>
          <SheetDescription className="sr-only">Review items and send your order on WhatsApp.</SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-secondary">
              <ShoppingBasket className="size-7 text-primary" />
            </div>
            <p className="text-lg font-semibold">Your basket is empty</p>
            <p className="text-muted-foreground">Add a few products, then send your order to us on WhatsApp in one tap.</p>
            <Button variant="outline" size="xl" className="mt-2" onClick={() => setOpen(false)} asChild>
              <Link href="/#products">
                Browse products <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {lines.map(({ p, qty }) => (
                <li key={p.id} className="flex gap-3 py-4">
                  <Link href={productPath(p.id)} onClick={() => setOpen(false)} className="size-[4.5rem] shrink-0 overflow-hidden rounded-xl border">
                    <ProductImage src={p.image} name={p.name} category={p.category} width={160} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</p>
                      <button
                        onClick={() => setQuantity(p.id, 0)}
                        aria-label={`Remove ${p.name}`}
                        className="-mr-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.unit && `${p.unit} · `}
                      {money(p.price)} each
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper id={p.id} qty={qty} size="sm" className="w-28" />
                      <p className="font-bold tabular-nums">{money(qty * p.price)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {open && <Checkout lines={lines} total={total} count={count} />}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function readCustomer(): { name: string; address: string } {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "") as { name: string; address: string };
  } catch {
    return { name: "", address: "" };
  }
}

function buildMessage(lines: Line[], total: number, count: number, name: string, address: string, note: string) {
  const msg = [
    `Hello ${shop.name}, I'd like to place an order:`,
    "",
    ...lines.map(({ p, qty }, i) => `${i + 1}. ${p.name}${p.unit ? ` (${p.unit})` : ""} × ${qty} = ${money(qty * p.price)}  [${p.id}]`),
    "",
    `Total: ${money(total)} (${count} item${count === 1 ? "" : "s"})`,
    "",
    `Name: ${name}`,
  ];
  if (address) msg.push(`Address: ${address}`);
  if (note) msg.push(`Note: ${note}`);
  return msg.join("\n");
}

/** Mounted only while the sheet is open, so it can read saved details straight from the browser. */
function Checkout({ lines, total, count }: { lines: Line[]; total: number; count: number }) {
  const [saved] = useState(readCustomer);

  return (
    <form
      className="border-t bg-muted/40 px-5 pb-5 pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const name = String(form.get("name") ?? "").trim();
        const address = String(form.get("address") ?? "").trim();
        const note = String(form.get("note") ?? "").trim();
        try {
          localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, address }));
        } catch {
          /* not critical */
        }
        window.open(whatsappLink(buildMessage(lines, total, count, name, address, note)), "_blank", "noopener");
        toast.success("WhatsApp opened", { description: "Tap send in WhatsApp to confirm your order." });
      }}
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" name="name" required autoComplete="name" defaultValue={saved.name} className="h-10 bg-card" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-address">Delivery address</Label>
          <Textarea
            id="c-address"
            name="address"
            rows={2}
            autoComplete="street-address"
            defaultValue={saved.address}
            placeholder="House no., street, landmark, area"
            className="min-h-16 bg-card"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-note">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="c-note" name="note" placeholder="Delivery time, colour preference…" className="h-10 bg-card" />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="text-2xl font-bold tabular-nums">{money(total)}</span>
      </div>
      {shop.deliveryNote && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Truck className="size-3.5" /> {shop.deliveryNote}
        </p>
      )}

      <Button type="submit" variant="whatsapp" size="xl" className="mt-4 w-full">
        <MessageCircle /> Send order on WhatsApp
      </Button>
      <button
        type="button"
        onClick={() => confirm("Remove all items from your basket?") && clearBasket()}
        className="mx-auto mt-2 block text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        Clear basket
      </button>
    </form>
  );
}

/** Phone-only bar that appears once something is in the basket. */
export function MobileBasketBar({ products }: { products: BasketProduct[] }) {
  const { count, total } = useLines(products);
  if (!count) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <Button size="xl" className="w-full justify-between" onClick={openBasket}>
        <span className="flex items-center gap-2">
          <ShoppingBasket /> {count} item{count === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5">
          {money(total)} <ArrowRight />
        </span>
      </Button>
    </div>
  );
}
