export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function whatsappUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** 17.07.2026 */
export function formatDateDot(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const raw = dateStr.slice(0, 10);
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function formatDateTimeDot(
  dateStr?: string | null,
  timeStr?: string | null,
): string {
  const d = formatDateDot(dateStr);
  if (!timeStr) return d;
  return `${d} · ${timeStr.slice(0, 5)}`;
}
