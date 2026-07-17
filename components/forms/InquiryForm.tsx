"use client";

import { useActionState, useState } from "react";
import {
  submitInquiryAction,
  type InquiryState,
} from "@/lib/actions/inquiry";
import { BookingDatePicker } from "@/components/forms/BookingDatePicker";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  isValidEmail,
  isValidPersonName,
  isValidPhone,
  sanitizeNameInput,
  sanitizePhoneInput,
} from "@/lib/validation";

const initial: InquiryState = {};

const typeOptions = [
  { value: "WEDDING", label: "Düğün / Nişan" },
  { value: "PRODUCT", label: "Ürün / Dükkan" },
  { value: "DRONE", label: "Drone" },
  { value: "CORPORATE", label: "Kurumsal" },
  { value: "OTHER", label: "Diğer" },
];

const fieldClass =
  "w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none";

const fieldErrorClass =
  "w-full rounded-xl border border-danger/50 bg-danger/5 px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-danger focus:outline-none";

export function InquiryForm({
  source = "contact",
  className,
  compact,
}: {
  source?: string;
  className?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(submitInquiryAction, initial);
  const requireSlot = source === "randevu" || source.startsWith("service:");

  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  function validateLocal() {
    const errs: typeof fieldErrors = {};
    if (!isValidPersonName(name)) {
      errs.name = "Sadece harf kullanın (örn. Ayşe Yılmaz).";
    }
    if (!isValidPhone(phone)) {
      errs.phone = "Geçerli telefon girin (örn. 0532 123 45 67).";
    }
    if (email.trim() && !isValidEmail(email)) {
      errs.email = "Geçerli e-posta girin (örn. ornek@mail.com).";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  if (state.ok) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-success/40 bg-success/10 p-8 text-center",
          className,
        )}
      >
        <p className="font-serif text-2xl text-foreground">Teşekkürler</p>
        <p className="mt-3 text-sm text-muted">
          Talebiniz alındı. Onay sonrası seçtiğiniz tarih/saat takvimde rezerve
          edilir; dolu slotlar başkalarına kapanır.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={cn("space-y-4", className)}
      onSubmit={(e) => {
        if (!validateLocal()) {
          e.preventDefault();
          return;
        }
        if (requireSlot && (!eventDate || !eventTime)) {
          e.preventDefault();
        }
      }}
      noValidate
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="eventDate" value={eventDate} />
      <input type="hidden" name="eventTime" value={eventTime} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs text-muted">
            Ad Soyad *
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            inputMode="text"
            value={name}
            onChange={(e) => {
              setName(sanitizeNameInput(e.target.value));
              if (fieldErrors.name) {
                setFieldErrors((f) => ({ ...f, name: undefined }));
              }
            }}
            onBlur={() => {
              if (name && !isValidPersonName(name)) {
                setFieldErrors((f) => ({
                  ...f,
                  name: "Sadece harf kullanın (örn. Ayşe Yılmaz).",
                }));
              }
            }}
            className={fieldErrors.name ? fieldErrorClass : fieldClass}
            placeholder="Ayşe Yılmaz"
            maxLength={80}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs text-muted">
            Telefon *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(sanitizePhoneInput(e.target.value));
              if (fieldErrors.phone) {
                setFieldErrors((f) => ({ ...f, phone: undefined }));
              }
            }}
            onBlur={() => {
              if (phone && !isValidPhone(phone)) {
                setFieldErrors((f) => ({
                  ...f,
                  phone: "Geçerli telefon girin (örn. 0532 123 45 67).",
                }));
              }
            }}
            className={fieldErrors.phone ? fieldErrorClass : fieldClass}
            placeholder="0532 123 45 67"
            maxLength={20}
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>
          )}
        </div>
      </div>

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value.replace(/\s/g, ""));
              if (fieldErrors.email) {
                setFieldErrors((f) => ({ ...f, email: undefined }));
              }
            }}
            onBlur={() => {
              if (email.trim() && !isValidEmail(email)) {
                setFieldErrors((f) => ({
                  ...f,
                  email: "Geçerli e-posta girin (örn. ornek@mail.com).",
                }));
              }
            }}
            className={fieldErrors.email ? fieldErrorClass : fieldClass}
            placeholder="ornek@mail.com"
            maxLength={254}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="type" className="mb-1.5 block text-xs text-muted">
            Hizmet tipi
          </label>
          <select
            id="type"
            name="type"
            className={fieldClass}
            defaultValue="OTHER"
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-1.5 block text-xs text-muted">
          Lokasyon
        </label>
        <input
          id="location"
          name="location"
          className={fieldClass}
          placeholder="Şehir / mekân"
        />
      </div>

      <BookingDatePicker
        eventDate={eventDate}
        eventTime={eventTime}
        onDateChange={setEventDate}
        onTimeChange={setEventTime}
        requireSlot={requireSlot}
        compact={compact}
      />

      <div>
        <label htmlFor="budget" className="mb-1.5 block text-xs text-muted">
          Bütçe aralığı (opsiyonel)
        </label>
        <input
          id="budget"
          name="budget"
          className={fieldClass}
          placeholder="Örn. 20–30 bin TL"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs text-muted">
          Mesaj *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={compact ? 4 : 5}
          className={cn(fieldClass, "resize-y")}
          placeholder="Konsept ve beklentilerinizi yazın..."
          minLength={10}
        />
      </div>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-muted">
        <input
          type="checkbox"
          name="kvkk"
          value="1"
          required
          className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
        />
        <span>
          <a
            href="/gizlilik"
            className="text-accent underline-offset-2 hover:underline"
          >
            KVKK aydınlatma metnini
          </a>{" "}
          okudum, kişisel verilerimin iletişim ve randevu amacıyla işlenmesini
          kabul ediyorum. *
        </span>
      </label>

      {state.error && (
        <p
          className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-foreground"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={
          pending ||
          (requireSlot && (!eventDate || !eventTime)) ||
          Boolean(fieldErrors.name || fieldErrors.phone || fieldErrors.email)
        }
        className="w-full sm:w-auto"
      >
        {pending ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
