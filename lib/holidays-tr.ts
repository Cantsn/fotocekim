/** Türkiye resmi tatilleri + bilinen özel günler (yaklaşık, yıl bazlı) */

export type HolidayInfo = {
  date: string; // YYYY-MM-DD
  title: string;
  type: "HOLIDAY" | "SPECIAL";
  blockBooking: boolean;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Basit Hicri/dini tatiller — sabit takvimli yaklaşım (her yıl admin özel gün ekleyebilir) */
const RAMADAN_BAYRAM: Record<number, string> = {
  2025: "2025-03-30",
  2026: "2026-03-20",
  2027: "2027-03-09",
  2028: "2028-02-26",
};

const KURBAN_BAYRAM: Record<number, string> = {
  2025: "2025-06-06",
  2026: "2026-05-27",
  2027: "2027-05-16",
  2028: "2028-05-05",
};

function addRange(
  out: HolidayInfo[],
  start: string,
  days: number,
  title: string,
  type: "HOLIDAY" | "SPECIAL" = "HOLIDAY",
) {
  const d = new Date(`${start}T12:00:00`);
  for (let i = 0; i < days; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() + i);
    out.push({
      date: ymd(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()),
      title: i === 0 ? title : `${title} (${i + 1}. gün)`,
      type,
      blockBooking: true,
    });
  }
}

export function getTurkeyHolidays(year: number): HolidayInfo[] {
  const list: HolidayInfo[] = [
    { date: ymd(year, 1, 1), title: "Yılbaşı", type: "HOLIDAY", blockBooking: true },
    { date: ymd(year, 4, 23), title: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı", type: "HOLIDAY", blockBooking: true },
    { date: ymd(year, 5, 1), title: "Emek ve Dayanışma Günü", type: "HOLIDAY", blockBooking: true },
    { date: ymd(year, 5, 19), title: "19 Mayıs Atatürk’ü Anma, Gençlik ve Spor Bayramı", type: "HOLIDAY", blockBooking: true },
    { date: ymd(year, 7, 15), title: "15 Temmuz Demokrasi ve Millî Birlik Günü", type: "HOLIDAY", blockBooking: true },
    { date: ymd(year, 8, 30), title: "30 Ağustos Zafer Bayramı", type: "HOLIDAY", blockBooking: true },
    { date: ymd(year, 10, 29), title: "29 Ekim Cumhuriyet Bayramı", type: "HOLIDAY", blockBooking: true },
    // Özel / anma (randevu genelde açık kalabilir)
    { date: ymd(year, 3, 8), title: "Dünya Kadınlar Günü", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 3, 18), title: "Çanakkale Zaferi ve Şehitleri Anma", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 4, 1), title: "1 Nisan (şaka günü)", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 5, 10), title: "Anneler Günü (yaklaşık 2. Pazar — kontrol edin)", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 6, 21), title: "Babalar Günü (yaklaşık 3. Pazar — kontrol edin)", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 11, 10), title: "10 Kasım Atatürk’ü Anma", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 11, 24), title: "Öğretmenler Günü", type: "SPECIAL", blockBooking: false },
    { date: ymd(year, 12, 31), title: "Yılbaşı arifesi", type: "SPECIAL", blockBooking: false },
  ];

  const ramazan = RAMADAN_BAYRAM[year];
  if (ramazan) addRange(list, ramazan, 3, "Ramazan Bayramı");
  const kurban = KURBAN_BAYRAM[year];
  if (kurban) addRange(list, kurban, 4, "Kurban Bayramı");

  return list;
}

export function getHolidaysInRange(fromYear: number, toYear: number): HolidayInfo[] {
  const out: HolidayInfo[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    out.push(...getTurkeyHolidays(y));
  }
  return out;
}
