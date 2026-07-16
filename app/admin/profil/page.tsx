import { guardAdminPage } from "@/lib/admin-guard";
import {
  PasswordForm,
  ProfileInfoForm,
} from "@/components/admin/ProfileForms";

export const dynamic = "force-dynamic";

export default async function AdminProfilPage() {
  const user = await guardAdminPage("dashboard");

  return (
    <div className="mx-auto max-w-xl space-y-12">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Profilim</h1>
        <p className="mt-2 text-sm text-muted">
          Hesap bilgileri ve şifre yönetimi.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <ProfileInfoForm name={user.name} email={user.email} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <PasswordForm />
      </div>
    </div>
  );
}
