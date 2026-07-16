import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "fotocekim_admin_session";

/**
 * Coolify / reverse-proxy arkasında request.url iç origin (http) olabilir.
 * Redirect'lerde X-Forwarded-* kullanılmazsa http↔https sonsuz döngü oluşur.
 */
function publicOrigin(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  if (host) {
    const proto =
      forwardedProto?.split(",")[0]?.trim() ||
      (request.nextUrl.protocol === "https:" ? "https" : "http");
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Login her zaman erişilebilir.
  // NOT: Cookie var diye /admin'e yönlendirme YAPMA —
  // geçersiz/eski cookie (örn. "authenticated") ile
  // /admin → login → /admin sonsuz döngü oluşur.
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  // Eski tek-değer cookie veya boş/geçersiz format → korumalı rotada login'e
  const looksLikeUserId = !!session && session !== "authenticated" && session.length >= 8;

  if (!looksLikeUserId) {
    const origin = publicOrigin(request);
    const loginUrl = new URL("/admin/login", origin);
    loginUrl.searchParams.set("from", pathname);

    const res = NextResponse.redirect(loginUrl);
    // Bozuk cookie'yi temizle
    if (session) {
      res.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
