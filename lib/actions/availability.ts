"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import {
  getDayAvailability,
  getBookingSettings,
  getMonthDaySummaries,
  type DayAvailability,
} from "@/lib/availability";

/** Public: seçilen güne ait slot listesi */
export async function fetchDaySlotsAction(
  date: string,
): Promise<DayAvailability> {
  return getDayAvailability(date);
}

export async function fetchMonthSummariesAction(year: number, month: number) {
  return getMonthDaySummaries(year, month);
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

export async function saveSpecialDayAction(formData: FormData) {
  await requirePermission("inquiries");
  const date = String(formData.get("date") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "SPECIAL");
  const note = String(formData.get("note") ?? "").trim();
  const blockBooking =
    formData.get("blockBooking") === "on" ||
    formData.get("blockBooking") === "true";
  if (!date || !title) return;
  await prisma.specialDay.create({
    data: { date, title, type, note, blockBooking },
  });
  revalidatePath("/admin/takvim");
  revalidatePath("/randevu");
}

export async function deleteSpecialDayAction(formData: FormData) {
  await requirePermission("inquiries");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.specialDay.delete({ where: { id } });
  revalidatePath("/admin/takvim");
  revalidatePath("/randevu");
}

/** Admin: manuel randevu oluştur (bireysel / telefon) */
export async function createManualAppointmentAction(formData: FormData) {
  await requirePermission("inquiries");
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "OTHER");
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  let eventTime = String(formData.get("eventTime") ?? "").trim();
  if (eventTime.length >= 5) eventTime = eventTime.slice(0, 5);
  const location = String(formData.get("location") ?? "").trim() || null;
  const message =
    String(formData.get("message") ?? "").trim() || "Manuel randevu";
  const status = String(formData.get("status") ?? "CONFIRMED");
  const { isSlotAvailable } = await import("@/lib/availability");
  const { validateContactFields } = await import("@/lib/validation");

  if (!name || !phone || !eventDate || !eventTime) return;
  if (validateContactFields({ name, phone, email: email || undefined })) return;

  if (status === "CONFIRMED") {
    const free = await isSlotAvailable(eventDate, eventTime);
    if (!free) return;
  }

  let googleEventId: string | null = null;
  const finalStatus = ["NEW", "READ", "QUOTED", "CONFIRMED"].includes(status)
    ? status
    : "CONFIRMED";

  if (finalStatus === "CONFIRMED") {
    const { createGoogleCalendarEvent } = await import("@/lib/google-calendar");
    googleEventId = await createGoogleCalendarEvent({
      title: `Çekim: ${name}`,
      date: eventDate,
      time: eventTime,
      description: message,
      location: location || undefined,
    });
  }

  await prisma.inquiry.create({
    data: {
      name,
      phone,
      email,
      type,
      eventDate,
      eventTime,
      location,
      message,
      status: finalStatus,
      source: "manual",
      googleEventId,
    },
  });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin/takvim");
  revalidatePath("/randevu");
}

export async function deleteInquiryAction(formData: FormData) {
  await requirePermission("inquiries");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const row = await prisma.inquiry.findUnique({ where: { id } });
  if (row?.googleEventId) {
    const { deleteGoogleCalendarEvent } = await import("@/lib/google-calendar");
    await deleteGoogleCalendarEvent(row.googleEventId);
  }
  await prisma.inquiry.delete({ where: { id } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin/takvim");
  revalidatePath("/randevu");
}

export async function disconnectGoogleAction() {
  await requirePermission("inquiries");
  const { disconnectGoogleCalendar } = await import("@/lib/google-calendar");
  await disconnectGoogleCalendar();
  revalidatePath("/admin/takvim");
}
