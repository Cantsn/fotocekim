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

/**
 * Infinite horizontal slider: items are triplicated so the track can
 * soft-loop without a hard jump. Continuous auto-scroll + arrow/drag.
 */
export function HorizontalSlider({
  children,
  className,
  itemClassName,
  autoPlay = true,
  /** Pixels per second for continuous soft scroll */
  speed = 36,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  autoPlay?: boolean;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const setWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const items = Children.toArray(children);

  // Need at least 1 item; clone to 3 copies for seamless loop
  const copies = items.length > 0 ? 3 : 0;
  const loopItems = Array.from({ length: copies }, (_, copy) =>
    items.map((child, i) => ({ child, key: `${copy}-${i}`, copy, i })),
  ).flat();

  const measureSet = useCallback(() => {
    const el = ref.current;
    if (!el || items.length === 0) return 0;
    // Width of one full set = scrollWidth / copies
    const w = el.scrollWidth / copies;
    setWidthRef.current = w;
    return w;
  }, [items.length, copies]);

  const normalizeScroll = useCallback(() => {
    const el = ref.current;
    if (!el || setWidthRef.current <= 0) return;
    const setW = setWidthRef.current;
    // Keep scrollLeft inside the middle copy [setW, 2*setW)
    if (el.scrollLeft < setW * 0.5) {
      el.scrollLeft += setW;
    } else if (el.scrollLeft >= setW * 1.5) {
      el.scrollLeft -= setW;
    }
  }, []);

  // Initial position: start of middle set
  useEffect(() => {
    const el = ref.current;
    if (!el || items.length < 1) return;

    const place = () => {
      const setW = measureSet();
      if (setW > 0) {
        el.scrollLeft = setW;
      }
    };

    place();
    // Recenter after layout (images etc.)
    const t = window.setTimeout(place, 120);
    window.addEventListener("resize", place);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
    };
  }, [items.length, measureSet]);

  // Continuous soft auto-scroll
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!autoPlay || items.length < 2) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const el = ref.current;
      if (el && !pausedRef.current && !draggingRef.current) {
        const dt = Math.min(now - last, 48) / 1000;
        last = now;
        if (setWidthRef.current <= 0) measureSet();
        el.scrollLeft += speed * dt;
        normalizeScroll();
      } else {
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoPlay, items.length, speed, measureSet, normalizeScroll]);

  // Manual scroll / touch: keep loop normalized
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let idle: number | undefined;

    const onScroll = () => {
      if (draggingRef.current) return;
      // Debounce normalize slightly so smooth arrow scroll finishes
      if (idle) window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        measureSet();
        normalizeScroll();
      }, 80);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (idle) window.clearTimeout(idle);
    };
  }, [measureSet, normalizeScroll]);

  const scrollByDir = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      measureSet();
      const card = el.querySelector<HTMLElement>("[data-slide-item]");
      const amount =
        card != null
          ? card.offsetWidth + 16
          : Math.min(el.clientWidth * 0.85, 360);
      el.scrollBy({ left: dir * amount, behavior: "smooth" });
      // After smooth scroll, re-normalize
      window.setTimeout(() => {
        measureSet();
        normalizeScroll();
      }, 450);
    },
    [measureSet, normalizeScroll],
  );

  if (items.length === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      onTouchStart={() => {
        setPaused(true);
        draggingRef.current = true;
      }}
      onTouchEnd={() => {
        draggingRef.current = false;
        window.setTimeout(() => setPaused(false), 1200);
      }}
    >
      {/* Side arrow columns — vertically centered on the track only */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-start pl-1 sm:w-12 sm:pl-0">
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition hover:border-accent hover:bg-card sm:h-10 sm:w-10"
          aria-label="Önceki"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-11 items-center justify-end pr-1 sm:w-12 sm:pr-0">
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition hover:border-accent hover:bg-card sm:h-10 sm:w-10"
          aria-label="Sonraki"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto px-11 pb-1 sm:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollBehavior: "auto" }}
        onPointerDown={() => {
          draggingRef.current = true;
          setPaused(true);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerLeave={() => {
          draggingRef.current = false;
        }}
      >
        {loopItems.map(({ child, key }) => (
          <div
            key={key}
            data-slide-item
            className={cn(
              "w-[min(78vw,300px)] shrink-0 sm:w-[300px] lg:w-[340px]",
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
