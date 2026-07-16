"use server";

import { addInquiry } from "@/lib/data";
import type { InquiryType } from "@/lib/types";

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
