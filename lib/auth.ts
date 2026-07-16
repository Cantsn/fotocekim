import { cookies } from "next/headers";

const SESSION_COOKIE = "fotocekim_admin_session";
const SESSION_VALUE = "authenticated";

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL ?? "admin@fotocekim.com",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function createAdminSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    throw new Error("UNAUTHORIZED");
  }
}
