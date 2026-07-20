import { Camera } from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import { getSiteSettings } from "@/lib/data";
import { normalizeInstagramUsername } from "@/lib/instagram";
import { InstagramImportPanel } from "@/components/admin/InstagramImportPanel";

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  await guardAdminPage("portfolio");
  const settings = await getSiteSettings();
  const defaultUsername =
    normalizeInstagramUsername(settings.instagram) || settings.instagram;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl text-foreground sm:text-3xl">
          <Camera className="h-7 w-7 text-accent" />
          Instagram → Portföy
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Instagram kullanıcı adınızı yazın, gönderileri çekin, seçtiklerinizi
          portföye aktarın. Meta API / token gerekmez. Açıklamadaki
          düğün–nişan kelimelerine göre otomatik filtre ve kategori önerisi
          yapılır.
        </p>
      </div>

      <InstagramImportPanel defaultUsername={defaultUsername} />
    </div>
  );
}
