import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminAyarlarPage() {
  const siteSettings = await getSiteSettings();

  const rows: [string, string | boolean][] = [
    ["Site adı", siteSettings.siteName],
    ["Slogan", siteSettings.tagline],
    ["Telefon", siteSettings.phone],
    ["WhatsApp", siteSettings.whatsapp],
    ["E-posta", siteSettings.email],
    ["Adres", siteSettings.address],
    ["Şehir", siteSettings.city],
    ["Instagram", siteSettings.instagram],
    ["YouTube", siteSettings.youtube],
    ["Fiyat göster", siteSettings.showPrices ? "Evet" : "Hayır"],
    ["SEO title", siteSettings.seoTitle],
    ["SEO description", siteSettings.seoDescription],
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Site ayarları</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Değerler veritabanındaki SiteSettings kaydından okunuyor. Form ile düzenleme
        sonraki fazda eklenecek.
      </p>
      <dl className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:gap-4"
          >
            <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
            <dd className="text-sm break-all text-foreground">{String(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
