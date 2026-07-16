import { getBookingSettings } from "@/lib/availability";
import { saveBookingSettingsAction } from "@/lib/actions/availability";
import { Field, fieldClass } from "./FormFields";

const DAYS = [
  { v: 1, l: "Pzt" },
  { v: 2, l: "Sal" },
  { v: 3, l: "Çar" },
  { v: 4, l: "Per" },
  { v: 5, l: "Cum" },
  { v: 6, l: "Cmt" },
  { v: 0, l: "Paz" },
];

export async function BookingSettingsForm() {
  const s = await getBookingSettings();

  return (
    <form action={saveBookingSettingsAction} className="space-y-4">
      <h2 className="font-serif text-xl text-foreground">Randevu müsaitlik</h2>
      <p className="text-xs text-muted">
        Çalışma saatleri ve slot süresi. Onaylı randevular bu slotları kapatır.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlangıç saati (0–23)">
          <input
            name="workStartHour"
            type="number"
            min={0}
            max={23}
            defaultValue={s.workStartHour}
            className={fieldClass}
          />
        </Field>
        <Field label="Bitiş saati (0–23)">
          <input
            name="workEndHour"
            type="number"
            min={1}
            max={24}
            defaultValue={s.workEndHour}
            className={fieldClass}
          />
        </Field>
        <Field label="Slot süresi (dakika)">
          <select
            name="slotMinutes"
            defaultValue={s.slotMinutes}
            className={fieldClass}
          >
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
            <option value={120}>120</option>
          </select>
        </Field>
        <Field label="Kaç gün ileriye randevu alınabilsin">
          <input
            name="bookingHorizonDays"
            type="number"
            min={7}
            max={365}
            defaultValue={s.bookingHorizonDays}
            className={fieldClass}
          />
        </Field>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted">Çalışma günleri</p>
        <div className="flex flex-wrap gap-3">
          {DAYS.map((d) => (
            <label key={d.v} className="flex items-center gap-1.5 text-sm text-muted">
              <input
                type="checkbox"
                name="workDays"
                value={d.v}
                defaultChecked={s.workDays.includes(d.v)}
                className="accent-[var(--accent)]"
              />
              {d.l}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-white"
      >
        Müsaitlik ayarlarını kaydet
      </button>
    </form>
  );
}
