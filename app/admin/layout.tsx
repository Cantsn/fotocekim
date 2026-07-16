import { isAdminAuthenticated } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  // Login page renders without shell
  if (!authed) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
