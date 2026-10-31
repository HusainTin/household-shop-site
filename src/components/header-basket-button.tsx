"use client";

import { MessageCircle, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openBasket, useBasketCount } from "@/lib/basket-store";
import { whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import { shop } from "@/shop.config";

export function HeaderBasketButton() {
  const count = useBasketCount();
  return (
    <Button
      onClick={openBasket}
      aria-label={`Open basket${count ? `, ${count} items` : ""}`}
      className="relative h-10 gap-2 rounded-xl px-3.5 font-semibold"
    >
      <ShoppingBasket className="size-5" />
      <span className="hidden sm:inline">Basket</span>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-offer px-1 text-[0.7rem] font-bold text-offer-foreground ring-2 ring-background tabular-nums">
          {count}
        </span>
      )}
    </Button>
  );
}

/** Floating chat button; moves up on phones when the basket bar is showing. */
export function WhatsAppFloat() {
  const count = useBasketCount();
  return (
    <a
      href={whatsappLink(`Hello ${shop.name}, `)}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lift transition-all hover:scale-105",
        count > 0 ? "bottom-24 md:bottom-5" : "bottom-5",
      )}
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
