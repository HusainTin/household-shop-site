"use client";

import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openBasket, setQuantity, useBasket } from "@/lib/basket-store";
import { cn } from "@/lib/utils";

type Props = { id: string; name: string; inStock: boolean; size?: "md" | "xl"; className?: string };

export function AddToBasket({ id, name, inStock, size = "md", className }: Props) {
  const qty = useBasket()[id] ?? 0;
  const big = size === "xl";

  if (!inStock) {
    return (
      <Button variant="outline" disabled className={cn("w-full", big ? "h-12 text-base" : "h-10", className)}>
        Out of stock
      </Button>
    );
  }

  if (!qty) {
    return (
      <Button
        variant={big ? "default" : "soft"}
        size={big ? "xl" : "lg"}
        className={cn("w-full", !big && "h-10 font-semibold", className)}
        onClick={() => {
          setQuantity(id, 1);
          toast.success(`${name} added`, { action: { label: "View basket", onClick: openBasket } });
        }}
      >
        {big ? <ShoppingBasket /> : <Plus />}
        {big ? "Add to basket" : "Add"}
      </Button>
    );
  }

  return <QuantityStepper id={id} qty={qty} size={size} className={className} />;
}

export function QuantityStepper({
  id,
  qty,
  size = "md",
  className,
}: {
  id: string;
  qty: number;
  size?: "sm" | "md" | "xl";
  className?: string;
}) {
  const h = size === "xl" ? "h-12" : size === "sm" ? "h-8" : "h-10";
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center overflow-hidden rounded-xl bg-primary text-primary-foreground",
        h,
        className,
      )}
    >
      <button
        onClick={() => setQuantity(id, qty - 1)}
        aria-label="Remove one"
        className="grid h-full aspect-square place-items-center transition hover:bg-black/10"
      >
        <Minus className="size-4" />
      </button>
      <span className="text-center text-sm font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        onClick={() => setQuantity(id, qty + 1)}
        aria-label="Add one"
        className="grid h-full aspect-square place-items-center transition hover:bg-black/10"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
