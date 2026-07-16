import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Google Takvim aboneliği için ICS feed.
 * URL: /api/calendar/ics?token=...
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings?.calendarFeedToken || token !== settings.calendarFeedToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const inquiries = await prisma.inquiry.findMany({
    where: {
      status: "CONFIRMED",
      eventDate: { not: null },
    },
    orderBy: { eventDate: "asc" },
  });

  const siteName = settings.siteName || "FotoCekim";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteName}//Randevu//TR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(siteName)} Randevular`,
    "X-WR-TIMEZONE:Europe/Istanbul",
  ];

  for (const i of inquiries) {
    if (!i.eventDate) continue;
    const time = (i.eventTime || "10:00").replace(":", "");
    const day = i.eventDate.replace(/-/g, "");
    const start = `${day}T${time}00`;
    // +1 hour default
    const [hh, mm] = (i.eventTime || "10:00").split(":").map(Number);
    const endH = String(hh + 1).padStart(2, "0");
    const endM = String(mm).padStart(2, "0");
    const end = `${day}T${endH}${endM}00`;
    const uid = `${i.id}@fotocekim`;
    const summary = `${i.name} — ${i.type}`;
    const desc = [i.phone, i.email, i.location, i.message]
      .filter(Boolean)
      .join("\\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${day}T000000Z`,
      `DTSTART;TZID=Europe/Istanbul:${start}`,
      `DTEND;TZID=Europe/Istanbul:${end}`,
      `SUMMARY:${escapeIcs(summary)}`,
      `DESCRIPTION:${escapeIcs(desc)}`,
      i.location ? `LOCATION:${escapeIcs(i.location)}` : "",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  const body = lines.filter(Boolean).join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fotocekim-randevular.ics"',
      "Cache-Control": "no-store",
    },
  });
}

function escapeIcs(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
