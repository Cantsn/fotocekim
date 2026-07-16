import { prisma } from "@/lib/prisma";
import { getHolidaysInRange, type HolidayInfo } from "@/lib/holidays-tr";
export type BookingSettings = {
  workStartHour: number;
  workEndHour: number;
  slotMinutes: number;
  workDays: number[];
  bookingHorizonDays: number;
};

export type DayMeta = {
  labels: { title: string; type: string }[];
  isHoliday: boolean;
  isSpecial: boolean;
  bookingBlockedBySpecial: boolean;
};

export type DayAvailability = {
  date: string;
  isWorkDay: boolean;
  fullyBlocked: boolean;
  meta: DayMeta;
  slots: { time: string; available: boolean; reason?: string }[];
};

const DEFAULT_SETTINGS: BookingSettings = {
  workStartHour: 9,
  workEndHour: 18,
  slotMinutes: 60,
  workDays: [1, 2, 3, 4, 5, 6],
  bookingHorizonDays: 90,
};

export async function getBookingSettings(): Promise<BookingSettings> {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!s) return DEFAULT_SETTINGS;
    let workDays = DEFAULT_SETTINGS.workDays;
    try {
      const parsed = JSON.parse(s.workDays) as number[];
      if (Array.isArray(parsed)) workDays = parsed;
    } catch {
      /* keep default */
    }
    return {
      workStartHour: s.workStartHour ?? 9,
      workEndHour: s.workEndHour ?? 18,
      slotMinutes: s.slotMinutes ?? 60,
      workDays,
      bookingHorizonDays: s.bookingHorizonDays ?? 90,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function generateTimeSlots(
  startHour: number,
  endHour: number,
  slotMinutes: number,
): string[] {
  const slots: string[] = [];
  const start = startHour * 60;
  const end = endHour * 60;
  for (let m = start; m + slotMinutes <= end; m += slotMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(
      `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
    );
  }
  return slots;
}

function parseDateOnly(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isPastDate(dateStr: string): boolean {
  const d = parseDateOnly(dateStr);
  if (!d) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(d);
  cmp.setHours(0, 0, 0, 0);
  return cmp < today;
}

export async function getSpecialDaysMap(
  from?: string,
  to?: string,
): Promise<Map<string, DayMeta>> {
  const year = new Date().getFullYear();
  const holidays = getHolidaysInRange(year, year + 1);
  const custom = await prisma.specialDay.findMany({
    where:
      from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : undefined,
  });

  const map = new Map<string, DayMeta>();

  const add = (
    date: string,
    title: string,
    type: string,
    block: boolean,
  ) => {
    const cur = map.get(date) ?? {
      labels: [],
      isHoliday: false,
      isSpecial: false,
      bookingBlockedBySpecial: false,
    };
    cur.labels.push({ title, type });
    if (type === "HOLIDAY" || type === "CLOSED") cur.isHoliday = true;
    if (type === "SPECIAL") cur.isSpecial = true;
    if (block) cur.bookingBlockedBySpecial = true;
    map.set(date, cur);
  };

  for (const h of holidays) {
    if (from && h.date < from) continue;
    if (to && h.date > to) continue;
    add(h.date, h.title, h.type, h.blockBooking);
  }
  for (const c of custom) {
    add(c.date, c.title, c.type, c.blockBooking);
  }
  return map;
}

export async function getDayMeta(dateStr: string): Promise<DayMeta> {
  const map = await getSpecialDaysMap(dateStr, dateStr);
  return (
    map.get(dateStr) ?? {
      labels: [],
      isHoliday: false,
      isSpecial: false,
      bookingBlockedBySpecial: false,
    }
  );
}

export async function getBlockedSlots(fromDate?: string, toDate?: string) {
  return prisma.blockedSlot.findMany({
    where: {
      ...(fromDate || toDate
        ? {
            date: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    },
  });
}

export async function getDayAvailability(dateStr: string): Promise<DayAvailability> {
  const settings = await getBookingSettings();
  const meta = await getDayMeta(dateStr);
  const date = parseDateOnly(dateStr);

  const emptyMeta = meta;

  if (!date || isPastDate(dateStr)) {
    return {
      date: dateStr,
      isWorkDay: false,
      fullyBlocked: true,
      meta: emptyMeta,
      slots: [],
    };
  }

  const dow = date.getDay();
  const isWorkDay = settings.workDays.includes(dow);
  const allSlots = generateTimeSlots(
    settings.workStartHour,
    settings.workEndHour,
    settings.slotMinutes,
  );

  if (!isWorkDay) {
    return {
      date: dateStr,
      isWorkDay: false,
      fullyBlocked: true,
      meta,
      slots: allSlots.map((time) => ({
        time,
        available: false,
        reason: "Çalışma günü değil",
      })),
    };
  }

  if (meta.bookingBlockedBySpecial) {
    return {
      date: dateStr,
      isWorkDay: true,
      fullyBlocked: true,
      meta,
      slots: allSlots.map((time) => ({
        time,
        available: false,
        reason: meta.labels[0]?.title || "Tatil / özel gün",
      })),
    };
  }

  const [confirmed, blocked] = await Promise.all([
    prisma.inquiry.findMany({
      where: {
        status: "CONFIRMED",
        eventDate: dateStr,
        eventTime: { not: null },
      },
      select: { eventTime: true, name: true },
    }),
    prisma.blockedSlot.findMany({ where: { date: dateStr } }),
  ]);

  const dayBlocked = blocked.some((b) => !b.time);
  const blockedTimes = new Set(
    blocked.filter((b) => b.time).map((b) => b.time as string),
  );
  const confirmedTimes = new Set(
    confirmed.map((c) => c.eventTime as string),
  );

  if (dayBlocked) {
    return {
      date: dateStr,
      isWorkDay: true,
      fullyBlocked: true,
      meta,
      slots: allSlots.map((time) => ({
        time,
        available: false,
        reason: "Gün kapalı",
      })),
    };
  }

  const slots = allSlots.map((time) => {
    if (blockedTimes.has(time)) {
      return { time, available: false, reason: "Kapalı" };
    }
    if (confirmedTimes.has(time)) {
      return { time, available: false, reason: "Dolu" };
    }
    return { time, available: true };
  });

  return {
    date: dateStr,
    isWorkDay: true,
    fullyBlocked: slots.every((s) => !s.available),
    meta,
    slots,
  };
}

export async function isSlotAvailable(
  dateStr: string,
  timeStr: string,
  excludeInquiryId?: string,
): Promise<boolean> {
  if (isPastDate(dateStr)) return false;
  const settings = await getBookingSettings();
  const date = parseDateOnly(dateStr);
  if (!date) return false;
  if (!settings.workDays.includes(date.getDay())) return false;

  const meta = await getDayMeta(dateStr);
  if (meta.bookingBlockedBySpecial) return false;

  const validSlots = generateTimeSlots(
    settings.workStartHour,
    settings.workEndHour,
    settings.slotMinutes,
  );
  if (!validSlots.includes(timeStr)) return false;

  const blocked = await prisma.blockedSlot.findFirst({
    where: {
      date: dateStr,
      OR: [{ time: null }, { time: timeStr }],
    },
  });
  if (blocked) return false;

  const confirmed = await prisma.inquiry.findFirst({
    where: {
      status: "CONFIRMED",
      eventDate: dateStr,
      eventTime: timeStr,
      ...(excludeInquiryId ? { NOT: { id: excludeInquiryId } } : {}),
    },
  });
  return !confirmed;
}

/** Ay görünümü için gün özetleri (public booking picker) */
export async function getMonthDaySummaries(
  year: number,
  month: number,
): Promise<
  Record<
    string,
    {
      availableCount: number;
      fullyBlocked: boolean;
      isWorkDay: boolean;
      meta: DayMeta;
    }
  >
> {
  const settings = await getBookingSettings();
  const lastDay = new Date(year, month, 0).getDate();
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const specialMap = await getSpecialDaysMap(from, to);
  const [confirmed, blocked] = await Promise.all([
    prisma.inquiry.findMany({
      where: {
        status: "CONFIRMED",
        eventDate: { gte: from, lte: to },
        eventTime: { not: null },
      },
      select: { eventDate: true, eventTime: true },
    }),
    prisma.blockedSlot.findMany({
      where: { date: { gte: from, lte: to } },
    }),
  ]);

  const allSlots = generateTimeSlots(
    settings.workStartHour,
    settings.workEndHour,
    settings.slotMinutes,
  );

  const result: Record<
    string,
    {
      availableCount: number;
      fullyBlocked: boolean;
      isWorkDay: boolean;
      meta: DayMeta;
    }
  > = {};

  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const meta = specialMap.get(dateStr) ?? {
      labels: [],
      isHoliday: false,
      isSpecial: false,
      bookingBlockedBySpecial: false,
    };
    const date = parseDateOnly(dateStr)!;
    const isWorkDay = settings.workDays.includes(date.getDay());
    const past = isPastDate(dateStr);
    const dayBlocked = blocked.some((b) => b.date === dateStr && !b.time);
    const blockedTimes = new Set(
      blocked
        .filter((b) => b.date === dateStr && b.time)
        .map((b) => b.time as string),
    );
    const confirmedTimes = new Set(
      confirmed
        .filter((c) => c.eventDate === dateStr)
        .map((c) => c.eventTime as string),
    );

    if (past || !isWorkDay || dayBlocked || meta.bookingBlockedBySpecial) {
      result[dateStr] = {
        availableCount: 0,
        fullyBlocked: true,
        isWorkDay: isWorkDay && !past,
        meta,
      };
      continue;
    }

    let availableCount = 0;
    for (const t of allSlots) {
      if (!blockedTimes.has(t) && !confirmedTimes.has(t)) availableCount++;
    }
    result[dateStr] = {
      availableCount,
      fullyBlocked: availableCount === 0,
      isWorkDay: true,
      meta,
    };
  }

  return result;
}

export function formatDateTR(dateStr: string) {
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export type { HolidayInfo };
