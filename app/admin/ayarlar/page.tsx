import { guardAdminPage } from "@/lib/admin-guard";
import { getSiteSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { BookingSettingsForm } from "@/components/admin/BookingSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminAyarlarPage() {
  await guardAdminPage("settings");
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl text-foreground">Site ayarları</h1>
      <p className="mb-8 text-sm text-muted">
        İletişim, SEO, sosyal, SMTP ve randevu müsaitlik yapılandırması.
      </p>
      <SettingsForm settings={settings} />
      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-card p-6">
        <BookingSettingsForm />
      </div>
    </div>
  );
}
