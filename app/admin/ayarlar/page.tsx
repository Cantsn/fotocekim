import { guardAdminPage } from "@/lib/admin-guard";
import { getSiteSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminAyarlarPage() {
  await guardAdminPage("settings");
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl text-foreground">Site ayarları</h1>
      <p className="mb-8 text-sm text-muted">
        İletişim, SEO, sosyal ve SMTP e-posta yapılandırması.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
