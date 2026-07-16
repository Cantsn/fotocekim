import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  hasPermission,
  type Permission,
} from "@/lib/permissions";

export const SESSION_COOKIE = "fotocekim_admin_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isOwner: boolean;
  permissions: string;
  active: boolean;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return !!user;
}

async function clearSessionCookie() {
  try {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
  } catch {
    // ignore — bazı RSC bağlamlarında set edilemeyebilir
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId || userId === "authenticated") {
    if (userId === "authenticated") await clearSessionCookie();
    return null;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      await clearSessionCookie();
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isOwner: user.isOwner,
      permissions: user.permissions,
      active: user.active,
    };
  } catch {
    return null;
  }
}

export async function createAdminSession(userId: string) {
  const store = await cookies();
  // Production + HTTPS (Coolify): Secure cookie
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") === true;

  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireAdmin();
  if (!hasPermission(user, permission)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function can(user: SessionUser, permission: Permission) {
  return hasPermission(user, permission);
}
