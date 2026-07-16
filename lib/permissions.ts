export const PERMISSIONS = [
  "dashboard",
  "inquiries",
  "portfolio",
  "services",
  "packages",
  "media",
  "settings",
  "team",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  dashboard: "Dashboard",
  inquiries: "Randevular / Mesajlar",
  portfolio: "Portföy",
  services: "Hizmetler",
  packages: "Paketler",
  media: "Medya",
  settings: "Site ayarları",
  team: "Ekip yönetimi",
};

export const ALL_PERMISSIONS: Permission[] = [...PERMISSIONS];

export function parsePermissions(raw: string | null | undefined): Permission[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((p): p is Permission =>
      PERMISSIONS.includes(p as Permission),
    );
  } catch {
    return [];
  }
}

export function stringifyPermissions(perms: Permission[]): string {
  return JSON.stringify([...new Set(perms)]);
}

export function hasPermission(
  user: { isOwner: boolean; permissions: string },
  permission: Permission,
): boolean {
  if (user.isOwner) return true;
  return parsePermissions(user.permissions).includes(permission);
}

/** Nav items with required permission */
export const ADMIN_NAV: {
  href: string;
  label: string;
  permission: Permission;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", permission: "dashboard", exact: true },
  { href: "/admin/takvim", label: "Takvim", permission: "inquiries" },
  { href: "/admin/randevular", label: "Randevular", permission: "inquiries" },
  { href: "/admin/portfolyo", label: "Portföy", permission: "portfolio" },
  { href: "/admin/hizmetler", label: "Hizmetler", permission: "services" },
  { href: "/admin/paketler", label: "Paketler", permission: "packages" },
  { href: "/admin/medya", label: "Medya", permission: "media" },
  { href: "/admin/ekip", label: "Ekip", permission: "team" },
  { href: "/admin/ayarlar", label: "Site ayarları", permission: "settings" },
  { href: "/admin/profil", label: "Profilim", permission: "dashboard" },
];
