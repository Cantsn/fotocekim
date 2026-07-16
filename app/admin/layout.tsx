import { getSessionUser } from "@/lib/auth";
import { parsePermissions } from "@/lib/permissions";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    return <AdminThemeProvider>{children}</AdminThemeProvider>;
  }

  return (
    <AdminThemeProvider>
      <AdminShell
        userName={user.name || user.email}
        permissions={parsePermissions(user.permissions)}
        isOwner={user.isOwner}
      >
        {children}
      </AdminShell>
    </AdminThemeProvider>
  );
}
