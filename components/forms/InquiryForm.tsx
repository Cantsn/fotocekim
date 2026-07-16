"use client";

import { useActionState, useState } from "react";
import {
  submitInquiryAction,
  type InquiryState,
} from "@/lib/actions/inquiry";
import { BookingDatePicker } from "@/components/forms/BookingDatePicker";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
    <form action={action} className={cn("space-y-4", className)}>
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
          <input id="name" name="name" required className={fieldClass} placeholder="Adınız" />
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
            className={fieldClass}
            placeholder="05XX XXX XX XX"
          />
        </div>
      </div>

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
            E-posta
          </label>
          <input id="email" name="email" type="email" className={fieldClass} placeholder="ornek@mail.com" />
        </div>
        <div>
          <label htmlFor="type" className="mb-1.5 block text-xs text-muted">
            Hizmet tipi
          </label>
          <select id="type" name="type" className={fieldClass} defaultValue="OTHER">
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
        <input id="location" name="location" className={fieldClass} placeholder="Şehir / mekân" />
      </div>

      <BookingDatePicker
        eventDate={eventDate}
        eventTime={eventTime}
        onDateChange={setEventDate}
        onTimeChange={setEventTime}
        requireSlot={requireSlot}
      />

      <div>
        <label htmlFor="budget" className="mb-1.5 block text-xs text-muted">
          Bütçe aralığı (opsiyonel)
        </label>
        <input id="budget" name="budget" className={fieldClass} placeholder="Örn. 20–30 bin TL" />
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
          <a href="/gizlilik" className="text-accent underline-offset-2 hover:underline">
            KVKK aydınlatma metnini
          </a>{" "}
          okudum, kişisel verilerimin iletişim ve randevu amacıyla işlenmesini kabul
          ediyorum. *
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
        disabled={pending || (requireSlot && (!eventDate || !eventTime))}
        className="w-full sm:w-auto"
      >
        {pending ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
