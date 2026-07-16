"use server";

import { addInquiry } from "@/lib/data";
import type { InquiryType } from "@/lib/types";
import { isSlotAvailable } from "@/lib/availability";

export type InquiryState = {
  ok?: boolean;
  error?: string;
};

const types: InquiryType[] = [
  "WEDDING",
  "PRODUCT",
  "DRONE",
  "CORPORATE",
  "OTHER",
];

export async function submitInquiryAction(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const honey = String(formData.get("website") ?? "");
  if (honey) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || undefined;
  const typeRaw = String(formData.get("type") ?? "OTHER");
  const eventDate = String(formData.get("eventDate") ?? "").trim() || undefined;
  const eventTime = String(formData.get("eventTime") ?? "").trim() || undefined;
  const location = String(formData.get("location") ?? "").trim() || undefined;
  const message = String(formData.get("message") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim() || undefined;
  const source = String(formData.get("source") ?? "contact").trim();
  const kvkk = formData.get("kvkk");

  if (!name || name.length < 2) {
    return { error: "Lütfen adınızı girin." };
  }
  if (!phone || phone.length < 10) {
    return { error: "Geçerli bir telefon numarası girin." };
  }
  if (!message || message.length < 10) {
    return { error: "Mesajınız en az 10 karakter olmalı." };
  }
  if (!kvkk) {
    return { error: "Devam etmek için KVKK metnini onaylamalısınız." };
  }

  // Randevu kaynağında tarih + saat zorunlu
  const needsSlot = source === "randevu" || source.startsWith("service:");
  if (needsSlot) {
    if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return { error: "Lütfen çekim tarihi seçin." };
    }
    if (!eventTime || !/^\d{2}:\d{2}$/.test(eventTime)) {
      return { error: "Lütfen müsait bir saat seçin." };
    }
    const free = await isSlotAvailable(eventDate, eventTime);
    if (!free) {
      return {
        error:
          "Seçtiğiniz tarih/saat artık müsait değil. Lütfen başka bir slot seçin.",
      };
    }
  } else if (eventDate && eventTime) {
    const free = await isSlotAvailable(eventDate, eventTime);
    if (!free) {
      return {
        error:
          "Seçtiğiniz tarih/saat dolu. Lütfen başka bir slot seçin.",
      };
    }
  }

  const type = types.includes(typeRaw as InquiryType)
    ? (typeRaw as InquiryType)
    : "OTHER";

  try {
    await addInquiry({
      name,
      phone,
      email,
      type,
      eventDate,
      eventTime,
      location,
      message,
      budget,
      source,
    });
    return { ok: true };
  } catch (e) {
    console.error("Inquiry save failed", e);
    return { error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
