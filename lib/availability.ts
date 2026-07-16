import { prisma } from "@/lib/prisma";

export type BookingSettings = {
  workStartHour: number;
  workEndHour: number;
  slotMinutes: number;
  workDays: number[];
  bookingHorizonDays: number;
};

export type DayAvailability = {
  date: string;
  isWorkDay: boolean;
  fullyBlocked: boolean;
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

/** Onaylı randevular slotu kapatır */
export async function getConfirmedBookings(fromDate?: string, toDate?: string) {
  return prisma.inquiry.findMany({
    where: {
      status: "CONFIRMED",
      eventDate: {
        not: null,
        ...(fromDate || toDate
          ? {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            }
          : {}),
      },
      eventTime: { not: null },
    },
    select: {
      id: true,
      name: true,
      eventDate: true,
      eventTime: true,
      type: true,
      status: true,
      phone: true,
    },
  });
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
  const date = parseDateOnly(dateStr);
  if (!date || isPastDate(dateStr)) {
    return {
      date: dateStr,
      isWorkDay: false,
      fullyBlocked: true,
      slots: [],
    };
  }

  const dow = date.getDay(); // 0 Sun
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
      slots: allSlots.map((time) => ({
        time,
        available: false,
        reason: "Çalışma günü değil",
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
  const confirmedTimes = new Map(
    confirmed.map((c) => [c.eventTime as string, c.name]),
  );

  if (dayBlocked) {
    return {
      date: dateStr,
      isWorkDay: true,
      fullyBlocked: true,
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
      return {
        time,
        available: false,
        reason: "Dolu",
      };
    }
    return { time, available: true };
  });

  return {
    date: dateStr,
    isWorkDay: true,
    fullyBlocked: slots.every((s) => !s.available),
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

export async function getCalendarMonthData(year: number, month: number) {
  // month 1-12
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [inquiries, blocked, settings] = await Promise.all([
    prisma.inquiry.findMany({
      where: {
        eventDate: { gte: from, lte: to },
        NOT: { status: "CANCELLED" },
      },
      orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
    }),
    getBlockedSlots(from, to),
    getBookingSettings(),
  ]);

  return { from, to, inquiries, blocked, settings, year, month, lastDay };
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
