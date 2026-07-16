import { redirect } from "next/navigation";
import { getSessionUser, can } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

export async function guardAdminPage(permission: Permission) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!can(user, permission)) redirect("/admin");
  return user;
}
