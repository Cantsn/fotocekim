"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import {
  getDayAvailability,
  getBookingSettings,
  isSlotAvailable,
  type DayAvailability,
} from "@/lib/availability";

/** Public: seçilen güne ait slot listesi */
export async function fetchDaySlotsAction(
  date: string,
): Promise<DayAvailability> {
  return getDayAvailability(date);
}

export async function fetchBookingSettingsAction() {
  return getBookingSettings();
}

export async function blockSlotAction(formData: FormData) {
  await requirePermission("inquiries");
  const date = String(formData.get("date") ?? "").trim();
  let time = String(formData.get("time") ?? "").trim() || null;
  if (time && time.length >= 5) time = time.slice(0, 5); // HH:mm
  const reason = String(formData.get("reason") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  await prisma.blockedSlot.create({
    data: { date, time, reason },
  });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin/takvim");
}

export async function unblockSlotAction(formData: FormData) {
  await requirePermission("inquiries");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.blockedSlot.delete({ where: { id } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin/takvim");
}

export async function saveBookingSettingsAction(formData: FormData) {
  await requirePermission("settings");
  const workStartHour = Number(formData.get("workStartHour") ?? 9);
  const workEndHour = Number(formData.get("workEndHour") ?? 18);
  const slotMinutes = Number(formData.get("slotMinutes") ?? 60);
  const bookingHorizonDays = Number(formData.get("bookingHorizonDays") ?? 90);
  const workDays = formData
    .getAll("workDays")
    .map((v) => Number(v))
    .filter((n) => n >= 0 && n <= 6);

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: "FotoCekim",
      workStartHour,
      workEndHour,
      slotMinutes,
      bookingHorizonDays,
      workDays: JSON.stringify(workDays.length ? workDays : [1, 2, 3, 4, 5, 6]),
    },
    update: {
      workStartHour,
      workEndHour,
      slotMinutes,
      bookingHorizonDays,
      workDays: JSON.stringify(workDays.length ? workDays : [1, 2, 3, 4, 5, 6]),
    },
  });
  revalidatePath("/admin/ayarlar");
  revalidatePath("/randevu");
}

export async function checkSlotAvailableAction(date: string, time: string) {
  return isSlotAvailable(date, time);
}
