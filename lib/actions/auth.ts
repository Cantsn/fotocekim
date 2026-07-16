"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  getAdminCredentials,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const creds = getAdminCredentials();

  if (
    email !== creds.email.toLowerCase() ||
    password !== creds.password
  ) {
    return { error: "E-posta veya şifre hatalı." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
