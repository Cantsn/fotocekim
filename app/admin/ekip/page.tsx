import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { getTeamUsers } from "@/lib/data";
import { deleteTeamMemberAction } from "@/lib/actions/admin";
import { PERMISSION_LABELS, type Permission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminEkipPage() {
  await guardAdminPage("team");
  const users = await getTeamUsers();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Ekip üyeleri</h1>
          <p className="mt-2 text-sm text-muted">
            Yetkilere göre panel erişimi kısıtlanır.
          </p>
        </div>
        <Link
          href="/admin/ekip/yeni"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background"
        >
          + Üye ekle
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {u.name || "—"}{" "}
                  {u.isOwner && (
                    <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                      Sahip
                    </span>
                  )}
                  {!u.active && (
                    <span className="ml-2 text-[10px] text-danger">Pasif</span>
                  )}
                </p>
                <p className="text-sm text-muted">{u.email}</p>
                <p className="mt-2 text-xs text-muted">
                  {u.isOwner
                    ? "Tüm yetkiler"
                    : u.permissions
                        .map((p) => PERMISSION_LABELS[p as Permission] ?? p)
                        .join(" · ") || "Yetki yok"}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/admin/ekip/${u.id}`}
                  className="text-xs text-accent hover:underline"
                >
                  Düzenle
                </Link>
                {!u.isOwner && (
                  <form action={deleteTeamMemberAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className="text-xs text-danger hover:underline">
                      Sil
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
