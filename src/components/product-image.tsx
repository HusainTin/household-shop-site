"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryIcon, categoryHue } from "@/lib/category-icon";
import { imageSources } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  name: string;
  /** Category name: picks the placeholder icon and tint. */
  category: string;
  width: number;
  eager?: boolean;
  className?: string;
  /** Slight zoom when the parent `group` is hovered (product cards). */
  zoomOnHover?: boolean;
};

/**
 * Product photo with fallbacks: tries each source in turn (Drive has two
 * endpoints) and leaves a tinted category-icon tile visible if all fail or
 * the product has no photo yet.
 */
export function ProductImage({ src, name, category, width, eager, className, zoomOnHover }: Props) {
  const sources = imageSources(src, width);
  const [attempt, setAttempt] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const current = sources[attempt];
  const hue = categoryHue(category);

  // An image that failed before React hydrated never fires onError; catch that case.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setAttempt((a) => a + 1);
  }, []);

  return (
    <div className={cn("relative size-full overflow-hidden bg-muted", className)}>
      <div
        aria-hidden
        className="absolute inset-0 grid place-items-center"
        style={{ background: `linear-gradient(145deg, oklch(0.96 0.03 ${hue}), oklch(0.92 0.045 ${hue}))` }}
      >
        <CategoryIcon category={category} className="size-[34%] max-h-20 max-w-20" strokeWidth={1.4} style={{ color: `oklch(0.5 0.08 ${hue})` }} />
      </div>
      {current && (
        // Plain <img>: Drive already resizes via the size parameter, so Next's optimiser isn't needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          key={current}
          src={current}
          alt={name}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setAttempt((a) => a + 1)}
          className={cn(
            "absolute inset-0 size-full bg-white object-contain p-[6%] transition-transform duration-500 ease-out",
            zoomOnHover && "group-hover:scale-105",
          )}
        />
      )}
    </div>
  );
}
