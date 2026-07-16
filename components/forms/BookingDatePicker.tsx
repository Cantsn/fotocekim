"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  fetchBookingSettingsAction,
  fetchDaySlotsAction,
  fetchMonthSummariesAction,
} from "@/lib/actions/availability";
import { cn, formatDateDot } from "@/lib/utils";

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
    <div className="space-y-4 rounded-2xl border border-border bg-card p-3 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted sm:gap-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Müsait
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Dolu / kapalı
        </span>
        {requireSlot && (
          <span className="ml-auto rounded-full bg-accent-soft px-2 py-0.5 text-accent">
            *
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="h-9 min-w-9 rounded-full border border-border px-3 text-sm"
            >
              ←
            </button>
            <p className="truncate text-center font-serif text-base capitalize text-foreground sm:text-lg">
              {monthLabel}
              {loadingMonth ? " …" : ""}
            </p>
            <button
              type="button"
              onClick={() => shift(1)}
              className="h-9 min-w-9 rounded-full border border-border px-3 text-sm"
            >
              →
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted sm:gap-1">
            {WEEK.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {cells.map((day, idx) => {
              if (day == null)
                return <div key={`e-${idx}`} className="aspect-square" />;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const sum = summaries[dateStr];
              const outOfRange = dateStr < minDate || dateStr > maxDate;
              const selected = eventDate === dateStr;
              const selectable =
                !outOfRange && sum && !sum.fullyBlocked && sum.isWorkDay;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!selectable}
                  onClick={() => onDateChange(dateStr)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border text-xs font-medium transition sm:rounded-xl sm:text-sm",
                    selected && "border-accent bg-accent text-white shadow",
                    !selected &&
                      selectable &&
                      "border-emerald-500/35 bg-emerald-500/10 text-foreground active:scale-95",
                    !selected &&
                      !selectable &&
                      "cursor-not-allowed border-border bg-muted-bg text-muted opacity-55",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[180px] rounded-xl border border-border bg-muted-bg/40 p-3 sm:p-4">
          {eventDate && (
            <>
              <p className="font-serif text-base text-foreground sm:text-lg">
                {formatDateDot(eventDate)}
              </p>
              {dayMeta && dayMeta.labels[0] && (
                <p className="mt-1 text-[11px] text-muted">
                  {dayMeta.labels[0].title}
                </p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                {loadingSlots && (
                  <p className="col-span-full text-xs text-muted">…</p>
                )}
                {slots.map((s) => {
                  const sel = eventTime === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => onTimeChange(s.time)}
                      className={cn(
                        "rounded-lg border px-1 py-2 text-xs font-medium sm:rounded-xl sm:px-2 sm:text-sm",
                        s.available &&
                          !sel &&
                          "border-emerald-500/40 bg-card text-foreground",
                        s.available && sel && "border-accent bg-accent text-white",
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
                <p className="mt-3 text-sm font-medium text-foreground">
                  {formatDateDot(eventDate)} · {eventTime}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
