"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";

const styleMap: Record<string, string> = {
  accent: "bg-accent text-white border-accent",
  dark: "bg-[#1c1917] text-[#faf7f2] border-[#1c1917]",
  soft: "bg-accent-soft text-foreground border-accent/30",
};

export function AnnouncementBanner({
  announcement,
}: {
  announcement: Announcement;
}) {
  const [open, setOpen] = useState(true);
  const dismissKey = `fotocekim-announcement-${announcement.id}`;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(dismissKey) === "1") setOpen(false);
    } catch {
      /* ignore */
    }
  }, [dismissKey]);

  if (!open) return null;

  const colors = styleMap[announcement.style] || styleMap.accent;

  return (
    <div className={cn("border-b", colors)}>
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:items-center sm:px-6 lg:px-8">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 opacity-90 sm:mt-0" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium leading-snug">{announcement.title}</p>
          {announcement.message && (
            <p className="mt-0.5 text-xs leading-relaxed opacity-90 sm:text-sm">
              {announcement.message}
            </p>
          )}
          {announcement.linkUrl && (
            <Link
              href={announcement.linkUrl}
              className="mt-1 inline-block text-xs font-medium underline underline-offset-2 opacity-95 hover:opacity-100"
            >
              {announcement.linkLabel || "Detay"}
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            try {
              sessionStorage.setItem(dismissKey, "1");
            } catch {
              /* ignore */
            }
          }}
          className="shrink-0 rounded-full p-1 opacity-80 transition hover:opacity-100"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
