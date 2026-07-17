"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AnnouncementBanner({
  announcement,
}: {
  announcement: Announcement;
}) {
  // Sadece anlık kapatma — sayfa yenilenince tekrar görünür
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const style = announcement.style || "accent";

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b",
        style === "dark" && "border-[#2a241c] bg-[#1a1612]",
        style === "soft" && "border-accent/20 bg-gradient-to-r from-[#f7f0e4] via-[#faf6ef] to-[#f3e8d6]",
        style === "accent" &&
          "border-accent/30 bg-gradient-to-r from-[#8f6a32] via-[#c4a574] to-[#a67c3d]",
      )}
    >
      {/* decorative blurs */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{
          background:
            style === "soft" ? "#c4a574" : "rgba(255,255,255,0.45)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-8 -bottom-12 h-36 w-36 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            style === "dark" ? "#c4a574" : "rgba(255,255,255,0.5)",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div
          className={cn(
            "hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:flex",
            style === "soft"
              ? "bg-accent/15 text-accent"
              : "bg-white/15 text-white",
          )}
        >
          <Sparkles className="h-5 w-5" />
        </div>

        <div
          className={cn(
            "min-w-0 flex-1",
            style === "soft" ? "text-foreground" : "text-white",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                style === "soft"
                  ? "bg-accent/15 text-accent"
                  : "bg-white/20 text-white",
              )}
            >
              Kampanya
            </span>
            <p className="text-sm font-semibold leading-snug sm:text-base">
              {announcement.title}
            </p>
          </div>
          {announcement.message && (
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed sm:text-sm",
                style === "soft" ? "text-muted" : "text-white/90",
              )}
            >
              {announcement.message}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {announcement.linkUrl && (
            <Link
              href={announcement.linkUrl}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm",
                style === "soft"
                  ? "bg-accent text-white hover:bg-[#8f6a32]"
                  : "bg-white text-[#1c1917] hover:bg-white/90",
              )}
            >
              {announcement.linkLabel || "İncele"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-full p-2 transition",
              style === "soft"
                ? "text-muted hover:bg-black/5 hover:text-foreground"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
