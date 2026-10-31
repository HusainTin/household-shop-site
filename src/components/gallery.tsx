"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

/** How long the gallery waits, untouched, before moving to the next photo. */
const AUTOPLAY_MS = 5000;

export function Gallery({ images, name, category }: { images: string[]; name: string; category: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Bumped on every touch, click or key press so the autoplay countdown starts again.
  const [touched, setTouched] = useState(0);
  const [hovering, setHovering] = useState(false);
  const many = images.length > 1;

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const n = (i + images.length) % images.length;
    track.scrollTo({ left: n * track.clientWidth, behavior: "smooth" });
  };
  const nudge = () => setTouched((t) => t + 1);

  // The track scrolls natively (swipe on phones), so read the current photo from its position.
  const onScroll = () => {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    if (!many || hovering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goTo(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
    // goTo only depends on images.length, which `many` already tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, touched, hovering, many]);

  return (
    <div className="md:sticky md:top-24">
      <div
        className="group relative"
        onPointerDown={nudge}
        onWheel={nudge}
        onKeyDown={nudge}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-2xl border bg-card"
          aria-roledescription="carousel"
          aria-label={`${name} photos`}
        >
          {images.length ? (
            images.map((src, i) => (
              <div
                key={src + i}
                className="size-full flex-none snap-center"
                aria-roledescription="slide"
                aria-label={`Photo ${i + 1} of ${images.length}`}
              >
                <ProductImage src={src} name={name} category={category} width={900} eager={i === 0} />
              </div>
            ))
          ) : (
            <ProductImage name={name} category={category} width={900} />
          )}
        </div>

        {many && (
          <>
            <SlideButton side="left" onClick={() => goTo(active - 1)} />
            <SlideButton side="right" onClick={() => goTo(active + 1)} />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <span
                  key={src + i}
                  className={cn(
                    "h-1.5 rounded-full bg-foreground/25 transition-all",
                    i === active ? "w-5 bg-primary" : "w-1.5",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {many && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => {
                nudge();
                goTo(i);
              }}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "size-16 flex-none overflow-hidden rounded-xl border-2 transition sm:size-20",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage src={src} name={name} category={category} width={160} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SlideButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border bg-background/85 shadow-sm backdrop-blur transition hover:bg-background",
        "md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
