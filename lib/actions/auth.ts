"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createAdminSession,
  destroyAdminSession,
  getSessionUser,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";

export type LoginState = { error?: string };
export type ProfileState = { error?: string; ok?: boolean };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "E-posta veya şifre hatalı." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "E-posta veya şifre hatalı." };
  }

  await createAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !email) {
    return { error: "Ad ve e-posta gerekli." };
  }

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: user.id } },
  });
  if (existing) {
    return { error: "Bu e-posta başka bir kullanıcıda kayıtlı." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email },
  });

  return { ok: true };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireAdmin();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 8) {
    return { error: "Yeni şifre en az 8 karakter olmalı." };
  }
  if (next !== confirm) {
    return { error: "Yeni şifreler eşleşmiyor." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "Kullanıcı bulunamadı." };

  const ok = await verifyPassword(current, user.passwordHash);
  if (!ok) return { error: "Mevcut şifre hatalı." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return { ok: true };
}

export async function getCurrentUserAction() {
  return getSessionUser();
}
