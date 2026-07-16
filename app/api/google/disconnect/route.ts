import { NextResponse } from "next/server";
import { getSessionUser, can } from "@/lib/auth";
import { disconnectGoogleCalendar } from "@/lib/google-calendar";

export async function POST() {
  const user = await getSessionUser();
  if (!user || !can(user, "inquiries")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await disconnectGoogleCalendar();
  return NextResponse.redirect(
    new URL(
      "/admin/takvim?google=disconnected",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
  );
}
