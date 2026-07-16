"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  fetchBookingSettingsAction,
  fetchDaySlotsAction,
  fetchMonthSummariesAction,
} from "@/lib/actions/availability";
import { cn } from "@/lib/utils";

type DayMeta = {
  labels: { title: string; type: string }[];
  isHoliday: boolean;
  isSpecial: boolean;
  bookingBlockedBySpecial: boolean;
};

type Slot = { time: string; available: boolean; reason?: string };

type Summary = {
  availableCount: number;
  fullyBlocked: boolean;
  isWorkDay: boolean;
  meta: DayMeta;
};

const WEEK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function BookingDatePicker({
  eventDate,
  eventTime,
  onDateChange,
  onTimeChange,
  requireSlot,
}: {
  eventDate: string;
  eventTime: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  requireSlot?: boolean;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [slots, setSlots] = useState<Slot[]>([]);
  const [dayMeta, setDayMeta] = useState<DayMeta | null>(null);
  const [horizon, setHorizon] = useState(90);
  const [loadingMonth, startMonth] = useTransition();
  const [loadingSlots, startSlots] = useTransition();

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + horizon);
    return d.toISOString().slice(0, 10);
  }, [horizon]);

  useEffect(() => {
    fetchBookingSettingsAction().then((s) =>
      setHorizon(s.bookingHorizonDays || 90),
    );
  }, []);

  useEffect(() => {
    startMonth(async () => {
      const data = await fetchMonthSummariesAction(year, month);
      setSummaries(data);
    });
  }, [year, month]);

  useEffect(() => {
    onTimeChange("");
    if (!eventDate) {
      setSlots([]);
      setDayMeta(null);
      return;
    }
    startSlots(async () => {
      const day = await fetchDaySlotsAction(eventDate);
      setSlots(day.slots);
      setDayMeta(day.meta);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate]);

  function shift(delta: number) {
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
  }

  const lastDay = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const mondayOffset = (firstDow + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
            Çekim tarihi & saat
          </p>
          <p className="mt-1 text-sm text-muted">
            Takvimden müsait bir gün seçin; tatil ve özel günler işaretlidir.
          </p>
        </div>
        {requireSlot && (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] text-accent">
            Zorunlu
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px] text-muted">
        <LegendDot className="bg-emerald-500" label="Müsait" />
        <LegendDot className="bg-rose-500" label="Dolu / kapalı" />
        <LegendDot className="bg-amber-500" label="Tatil" />
        <LegendDot className="bg-violet-500" label="Özel gün" />
        <LegendDot className="bg-stone-300" label="Çalışılmıyor" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Month calendar */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="rounded-full border border-border px-3 py-1 text-sm hover:border-accent"
            >
              ←
            </button>
            <p className="font-serif text-lg capitalize text-foreground">
              {monthLabel}
              {loadingMonth && (
                <span className="ml-2 text-xs text-muted">…</span>
              )}
            </p>
            <button
              type="button"
              onClick={() => shift(1)}
              className="rounded-full border border-border px-3 py-1 text-sm hover:border-accent"
            >
              →
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted uppercase">
            {WEEK.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day == null) return <div key={`e-${idx}`} className="aspect-square" />;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const sum = summaries[dateStr];
              const outOfRange = dateStr < minDate || dateStr > maxDate;
              const selected = eventDate === dateStr;
              const holiday = sum?.meta.isHoliday;
              const special = sum?.meta.isSpecial && !holiday;
              const blocked =
                outOfRange ||
                sum?.fullyBlocked ||
                sum?.meta.bookingBlockedBySpecial;
              const selectable = !outOfRange && sum && !sum.fullyBlocked && sum.isWorkDay;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!selectable}
                  onClick={() => onDateChange(dateStr)}
                  title={
                    sum?.meta.labels.map((l) => l.title).join(", ") ||
                    (selectable
                      ? `${sum?.availableCount ?? 0} müsait slot`
                      : "Seçilemez")
                  }
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition",
                    selected && "border-accent bg-accent text-white shadow-md",
                    !selected &&
                      selectable &&
                      "border-emerald-500/30 bg-emerald-500/10 text-foreground hover:border-emerald-600",
                    !selected &&
                      blocked &&
                      !holiday &&
                      !special &&
                      "cursor-not-allowed border-border bg-muted-bg text-muted opacity-70",
                    !selected &&
                      holiday &&
                      "cursor-not-allowed border-amber-500/40 bg-amber-500/15 text-amber-900",
                    !selected &&
                      special &&
                      !blocked &&
                      "border-violet-400/40 bg-violet-500/10 text-foreground",
                    !selected &&
                      special &&
                      blocked &&
                      "cursor-not-allowed border-violet-400/40 bg-violet-500/10 text-muted",
                  )}
                >
                  <span className="font-medium">{day}</span>
                  {(holiday || special) && (
                    <span
                      className={cn(
                        "mt-0.5 h-1 w-1 rounded-full",
                        holiday ? "bg-amber-500" : "bg-violet-500",
                        selected && "bg-white",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail + slots */}
        <div className="flex flex-col rounded-xl border border-border bg-muted-bg/50 p-4">
          {!eventDate && (
            <p className="text-sm text-muted">
              Soldan bir gün seçtiğinizde müsait saatler burada listelenir.
            </p>
          )}

          {eventDate && (
            <>
              <p className="font-serif text-lg text-foreground">
                {new Date(`${eventDate}T12:00:00`).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              {dayMeta && dayMeta.labels.length > 0 && (
                <div className="mt-2 space-y-1">
                  {dayMeta.labels.map((l) => (
                    <span
                      key={l.title}
                      className={cn(
                        "mr-1 inline-block rounded-full border px-2 py-0.5 text-[11px]",
                        l.type === "HOLIDAY" || l.type === "CLOSED"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-900"
                          : "border-violet-400/40 bg-violet-500/10 text-violet-900",
                      )}
                    >
                      {l.type === "HOLIDAY"
                        ? "🏖 "
                        : l.type === "CLOSED"
                          ? "🔒 "
                          : "✨ "}
                      {l.title}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-muted">
                {loadingSlots
                  ? "Saatler yükleniyor…"
                  : slots.some((s) => s.available)
                    ? "Müsait bir saat dilimi seçin"
                    : "Bu günde müsait saat yok"}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => {
                  const sel = eventTime === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => onTimeChange(s.time)}
                      title={s.available ? "Müsait" : s.reason}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-sm font-medium transition",
                        s.available &&
                          !sel &&
                          "border-emerald-500/40 bg-card text-foreground hover:border-accent",
                        s.available &&
                          sel &&
                          "border-accent bg-accent text-white shadow",
                        !s.available &&
                          "cursor-not-allowed border-border bg-muted-bg text-muted line-through opacity-50",
                      )}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>

              {eventTime && (
                <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-foreground">
                  Seçiminiz:{" "}
                  <strong>
                    {eventDate} · {eventTime}
                  </strong>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", className)} />
      {label}
    </span>
  );
}
