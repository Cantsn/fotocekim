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

const WEEK = ["P", "S", "Ç", "P", "C", "C", "P"];
const WEEK_FULL = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function BookingDatePicker({
  eventDate,
  eventTime,
  onDateChange,
  onTimeChange,
  requireSlot,
  compact = false,
}: {
  eventDate: string;
  eventTime: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  requireSlot?: boolean;
  /** Dar sütun (hizmet teklif paneli) — her zaman dikey */
  compact?: boolean;
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

  const weekLabels = compact ? WEEK : WEEK_FULL;

  return (
    <div
      className={cn(
        "min-w-0 space-y-3 rounded-2xl border border-border bg-card",
        compact ? "p-2.5 sm:p-3" : "space-y-4 p-3 sm:p-5",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted",
          compact ? "text-[10px]" : "text-[11px] sm:gap-4",
        )}
      >
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />{" "}
          Müsait
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 sm:h-2 sm:w-2" />{" "}
          Dolu
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 sm:h-2 sm:w-2" />{" "}
          Tatil
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 sm:h-2 sm:w-2" />{" "}
          Özel
        </span>
      </div>

      {/*
        Takvim + saat her zaman alt alta.
        Form dar sütundayken (iletişim/hizmet paneli) yan yana layout
        saat butonlarının dışarı taşmasına yol açıyordu.
      */}
      <div className="grid min-w-0 grid-cols-1 gap-3">
        <div className="min-w-0 overflow-hidden">
          <div className="mb-2 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => shift(-1)}
              className={cn(
                "shrink-0 rounded-full border border-border",
                compact ? "h-8 w-8 text-sm" : "h-9 min-w-9 px-3 text-sm",
              )}
              aria-label="Önceki ay"
            >
              ←
            </button>
            <p
              className={cn(
                "min-w-0 truncate text-center font-serif capitalize text-foreground",
                compact ? "text-sm" : "text-base sm:text-lg",
              )}
            >
              {monthLabel}
              {loadingMonth ? " …" : ""}
            </p>
            <button
              type="button"
              onClick={() => shift(1)}
              className={cn(
                "shrink-0 rounded-full border border-border",
                compact ? "h-8 w-8 text-sm" : "h-9 min-w-9 px-3 text-sm",
              )}
              aria-label="Sonraki ay"
            >
              →
            </button>
          </div>

          <div
            className={cn(
              "mb-1 grid grid-cols-7 text-center font-medium text-muted",
              compact ? "gap-0.5 text-[9px]" : "gap-0.5 text-[10px] sm:gap-1",
            )}
          >
            {weekLabels.map((w, i) => (
              <div key={`${w}-${i}`} className="py-0.5">
                {w}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid grid-cols-7",
              compact ? "gap-0.5" : "gap-0.5 sm:gap-1",
            )}
          >
            {cells.map((day, idx) => {
              if (day == null)
                return (
                  <div
                    key={`e-${idx}`}
                    className={compact ? "aspect-square min-h-0" : "aspect-square"}
                  />
                );
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const sum = summaries[dateStr];
              const outOfRange = dateStr < minDate || dateStr > maxDate;
              const selected = eventDate === dateStr;
              const meta = sum?.meta;
              const hasHoliday = Boolean(meta?.isHoliday);
              const hasSpecial = Boolean(meta?.isSpecial) && !hasHoliday;
              const hasMark =
                hasHoliday || hasSpecial || Boolean(meta?.labels?.length);
              const selectable =
                !outOfRange && sum && !sum.fullyBlocked && sum.isWorkDay;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!selectable}
                  onClick={() => onDateChange(dateStr)}
                  title={
                    meta?.labels?.map((l) => l.title).join(" · ") || undefined
                  }
                  className={cn(
                    "relative flex aspect-square min-w-0 flex-col items-center justify-center border font-medium transition",
                    compact
                      ? "rounded-md text-[10px] leading-none"
                      : "rounded-lg text-xs sm:rounded-xl sm:text-sm",
                    selected && "border-accent bg-accent text-white shadow",
                    !selected &&
                      selectable &&
                      !hasMark &&
                      "border-emerald-500/35 bg-emerald-500/10 text-foreground",
                    !selected &&
                      selectable &&
                      hasHoliday &&
                      "border-amber-500/50 bg-amber-500/15 text-foreground",
                    !selected &&
                      selectable &&
                      hasSpecial &&
                      "border-violet-500/45 bg-violet-500/12 text-foreground",
                    !selected &&
                      !selectable &&
                      "cursor-not-allowed border-border bg-muted-bg text-muted opacity-55",
                  )}
                >
                  <span>{day}</span>
                  {hasMark && (
                    <span
                      className={cn(
                        "mt-0.5 rounded-full",
                        compact ? "h-0.5 w-0.5" : "h-1 w-1 sm:h-1.5 sm:w-1.5",
                        hasHoliday && "bg-amber-500",
                        hasSpecial && "bg-violet-500",
                        selected && "bg-white",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "min-w-0 overflow-hidden rounded-xl border border-border bg-muted-bg/40",
            compact ? "p-2.5" : "p-3 sm:p-4",
          )}
        >
          {!eventDate && (
            <p className={cn("text-muted", compact ? "text-[11px]" : "text-xs")}>
              Takvimden gün seçin; ardından saat listesi burada açılır.
            </p>
          )}

          {eventDate && (
            <>
              <p
                className={cn(
                  "font-serif text-foreground",
                  compact ? "text-sm" : "text-base sm:text-lg",
                )}
              >
                {formatDateDot(eventDate)}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-muted",
                  compact ? "text-[10px]" : "text-xs",
                )}
              >
                Saat seçin
              </p>

              {dayMeta && dayMeta.labels.length > 0 && (
                <div className="mt-2 space-y-1">
                  {dayMeta.labels.map((l) => (
                    <div
                      key={`${l.type}-${l.title}`}
                      className={cn(
                        "rounded-lg border px-2 py-1 text-[11px] leading-snug break-words",
                        l.type === "HOLIDAY" || l.type === "CLOSED"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-950"
                          : "border-violet-500/40 bg-violet-500/10 text-violet-950",
                      )}
                    >
                      <span className="font-medium">
                        {l.type === "HOLIDAY"
                          ? "Tatil"
                          : l.type === "CLOSED"
                            ? "Kapalı"
                            : "Özel gün"}
                        :
                      </span>{" "}
                      {l.title}
                      {dayMeta.bookingBlockedBySpecial && (
                        <span className="mt-0.5 block text-[10px] opacity-80">
                          Bu gün randevuya kapalı
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={cn(
                  "mt-2 grid w-full min-w-0",
                  // 4 sütun dar alanda da sığar; taşmayı engelle
                  compact
                    ? "grid-cols-4 gap-1"
                    : "grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2",
                )}
              >
                {loadingSlots && (
                  <p className="col-span-full text-xs text-muted">
                    Saatler yükleniyor…
                  </p>
                )}
                {!loadingSlots && slots.length === 0 && (
                  <p className="col-span-full text-xs text-muted">
                    Bu gün için müsait saat yok.
                  </p>
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
                        "box-border w-full min-w-0 max-w-full border font-medium tabular-nums",
                        compact
                          ? "rounded-md px-0.5 py-1.5 text-[10px] leading-tight"
                          : "rounded-lg px-0.5 py-2 text-[11px] leading-tight sm:rounded-xl sm:px-1 sm:text-xs",
                        s.available &&
                          !sel &&
                          "border-emerald-500/40 bg-card text-foreground hover:border-accent",
                        s.available &&
                          sel &&
                          "border-accent bg-accent text-white",
                        !s.available &&
                          "cursor-not-allowed border-border bg-muted-bg text-muted line-through opacity-50",
                      )}
                    >
                      {s.time.slice(0, 5)}
                    </button>
                  );
                })}
              </div>
              {eventTime && (
                <p
                  className={cn(
                    "mt-2 font-medium text-foreground break-words",
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  Seçilen: {formatDateDot(eventDate)} · {eventTime.slice(0, 5)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
