"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sağ altta; sayfa ortası/altına inince görünür (WhatsApp üstünde). */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Yaklaşık bir ekran kaydırınca göster
      setVisible(window.scrollY > Math.min(480, window.innerHeight * 0.55));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Sayfanın en üstüne çık"
      title="Yukarı çık"
      className={cn(
        "fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-lg shadow-black/15 backdrop-blur transition-all duration-300 sm:right-6 sm:h-12 sm:w-12",
        // WhatsApp (bottom-4/6 h-14) üstünde
        "bottom-[5.25rem] sm:bottom-[5.75rem]",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
        "hover:border-accent hover:bg-accent hover:text-white",
      )}
    >
      <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
    </button>
  );
}
