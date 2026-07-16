import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  saveGoogleTokens,
} from "@/lib/google-calendar";

export async function GET(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/admin/takvim?google=error", siteUrl),
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code, siteUrl);
    await saveGoogleTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });
    return NextResponse.redirect(
      new URL("/admin/takvim?google=connected", siteUrl),
    );
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      new URL("/admin/takvim?google=error", siteUrl),
    );
  }
}
