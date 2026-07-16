"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HorizontalSlider({
  children,
  className,
  itemClassName,
  autoPlay = true,
  intervalMs = 4500,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  autoPlay?: boolean;
  intervalMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const items = Children.toArray(children);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide-item]");
    const amount = card ? card.offsetWidth + 16 : Math.min(el.clientWidth * 0.85, 360);
    const max = el.scrollWidth - el.clientWidth;
    let next = el.scrollLeft + dir * amount;
    if (dir === 1 && el.scrollLeft >= max - 8) {
      next = 0; // soft loop
    }
    if (dir === -1 && el.scrollLeft <= 8) {
      next = max;
    }
    el.scrollTo({ left: next, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!autoPlay || paused || items.length < 2) return;
    const id = window.setInterval(() => scrollByDir(1), intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, paused, intervalMs, scrollByDir, items.length]);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition hover:border-accent sm:-left-3 sm:h-11 sm:w-11"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        className="absolute top-1/2 right-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition hover:border-accent sm:-right-3 sm:h-11 sm:w-11"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-10 pb-2 sm:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div
            key={i}
            data-slide-item
            className={cn(
              "w-[min(78vw,300px)] shrink-0 snap-start sm:w-[300px] lg:w-[340px]",
              itemClassName,
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
