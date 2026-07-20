import { Camera } from "lucide-react";
import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { getSiteSettings } from "@/lib/data";
import { InstagramImportPanel } from "@/components/admin/InstagramImportPanel";

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  await guardAdminPage("portfolio");
  const settings = await getSiteSettings();
  const hasCredentials = Boolean(
    settings.instagramUserId?.trim() && settings.instagramAccessToken?.trim(),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl text-foreground sm:text-3xl">
          <Camera className="h-7 w-7 text-accent" />
          Instagram → Portföy
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Instagram hesabınızdaki gönderileri çekin. Açıklama metnine göre
          (düğün, gelin, damat, nişan vb.) otomatik etiketler; seçtiklerinizi
          portföy projesine dönüştürür (kapak + galeri medyası indirilir).
        </p>
        <p className="mt-2 text-xs text-muted">
          Bağlantı:{" "}
          <Link href="/admin/ayarlar" className="text-accent hover:underline">
            Site ayarları → Instagram API
          </Link>
        </p>
      </div>

      <InstagramImportPanel hasCredentials={hasCredentials} />
    </div>
  );
}
