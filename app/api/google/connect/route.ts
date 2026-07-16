import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { can } from "@/lib/auth";
import {
  getGoogleAuthUrl,
  isGoogleOAuthConfigured,
} from "@/lib/google-calendar";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !can(user, "inquiries")) {
    return NextResponse.redirect(
      new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    );
  }
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/admin/takvim?google=missing_env",
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      ),
    );
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(getGoogleAuthUrl(siteUrl));
}
