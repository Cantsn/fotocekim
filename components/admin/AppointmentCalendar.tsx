"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn, formatDateDot } from "@/lib/utils";

export type CalInquiry = {
  id: string;
  name: string;
  phone: string;
  type: string;
  status: string;
  eventDate: string | null;
  eventTime: string | null;
  message: string;
};

export type CalBlocked = {
  id: string;
  date: string;
  time: string | null;
  reason: string;
};

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  READ: "bg-stone-500/15 text-stone-700 border-stone-400/40",
  QUOTED: "bg-amber-500/15 text-amber-800 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-800 border-emerald-500/40",
  CANCELLED: "bg-rose-500/10 text-rose-700 border-rose-400/30",
};

const STATUS_TR: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  QUOTED: "Teklif",
  CONFIRMED: "Onaylı",
  CANCELLED: "İptal",
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function AppointmentCalendar({
  inquiries,
  blocked,
  initialYear,
  initialMonth,
}: {
  inquiries: CalInquiry[];
  blocked: CalBlocked[];
  initialYear: number;
  initialMonth: number; // 1-12
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState<string | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  // Monday-first offset
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0 Sun
  const mondayOffset = (firstDow + 6) % 7;

  const byDate = useMemo(() => {
    const map = new Map<string, CalInquiry[]>();
    for (const i of inquiries) {
      if (!i.eventDate) continue;
      const list = map.get(i.eventDate) ?? [];
      list.push(i);
      map.set(i.eventDate, list);
    }
    return map;
  }, [inquiries]);

  const blockedByDate = useMemo(() => {
    const map = new Map<string, CalBlocked[]>();
    for (const b of blocked) {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [blocked]);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
    setSelected(null);
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const selectedItems = selected ? (byDate.get(selected) ?? []) : [];
  const selectedBlocks = selected ? (blockedByDate.get(selected) ?? []) : [];

  const cells: (number | null)[] = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:text-foreground"
          >
            ←
          </button>
          <h2 className="font-serif text-xl capitalize text-foreground">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:text-foreground"
          >
            →
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium tracking-wide text-muted uppercase">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day == null) {
              return <div key={`e-${idx}`} className="min-h-[4.5rem]" />;
            }
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const items = byDate.get(dateStr) ?? [];
            const blocks = blockedByDate.get(dateStr) ?? [];
            const confirmed = items.filter((i) => i.status === "CONFIRMED").length;
            const pending = items.filter(
              (i) => i.status !== "CONFIRMED" && i.status !== "CANCELLED",
            ).length;
            const isSel = selected === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelected(dateStr)}
                className={cn(
                  "min-h-[3.5rem] rounded-lg border p-1 text-left transition sm:min-h-[4.5rem] sm:rounded-xl sm:p-1.5",
                  isSel
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-muted-bg/40 hover:border-accent/40",
                  blocks.some((b) => !b.time) && "bg-rose-500/5",
                )}
              >
                <span className="text-[10px] font-medium text-foreground sm:text-xs">
                  {day}
                </span>
                <div className="mt-0.5 flex flex-wrap gap-0.5 sm:mt-1">
                  {confirmed > 0 && (
                    <span className="rounded bg-emerald-500/20 px-1 text-[8px] text-emerald-800 sm:text-[9px]">
                      {confirmed}
                    </span>
                  )}
                  {pending > 0 && (
                    <span className="rounded bg-amber-500/20 px-1 text-[8px] text-amber-800 sm:text-[9px]">
                      {pending}
                    </span>
                  )}
                  {blocks.length > 0 && (
                    <span className="rounded bg-rose-500/15 px-1 text-[8px] text-rose-700 sm:text-[9px]">
                      ×
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Onaylı (dolu)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Bekleyen talep
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Manuel kapalı
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-serif text-lg text-foreground">
          {selected ? formatDateDot(selected) : "Gün seçin"}
        </h3>

        {!selected && (
          <p className="mt-3 text-sm text-muted">
            Takvimden bir güne tıklayarak randevuları görün.
          </p>
        )}

        {selected && selectedItems.length === 0 && selectedBlocks.length === 0 && (
          <p className="mt-3 text-sm text-muted">Bu günde kayıt yok.</p>
        )}

        <ul className="mt-4 space-y-3">
          {selectedItems.map((i) => (
            <li
              key={i.id}
              className="rounded-xl border border-border bg-muted-bg/50 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">
                  {i.eventTime ? `${i.eventTime} · ` : ""}
                  {i.name}
                </p>
                {/* slot already shows time; date on parent */}
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px]",
                    STATUS_STYLE[i.status] ?? STATUS_STYLE.READ,
                  )}
                >
                  {STATUS_TR[i.status] ?? i.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {i.phone} · {i.type}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{i.message}</p>
            </li>
          ))}
          {selectedBlocks.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-rose-400/30 bg-rose-500/5 p-3 text-sm"
            >
              <p className="font-medium text-foreground">
                {b.time ? `${b.time} · ` : "Tüm gün · "}Kapalı
              </p>
              {b.reason && (
                <p className="mt-1 text-xs text-muted">{b.reason}</p>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted">
          Onaylamak için{" "}
          <Link href="/admin/randevular" className="text-accent hover:underline">
            Randevular listesi
          </Link>
          nden durumu &quot;Onay&quot; yapın. Onaylı slotlar sitede seçilemez.
        </p>
      </div>
    </div>
  );
}
