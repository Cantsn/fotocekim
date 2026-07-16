import {
  formatPrice,
  getPublishedPackages,
  getSiteSettings,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPaketlerPage() {
  const [list, settings] = await Promise.all([
    getPublishedPackages(),
    getSiteSettings(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Paketler</h1>
      <p className="mt-2 text-sm text-muted">
        Fiyat gösterimi: {settings.showPrices ? "Açık" : "Kapalı"}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-foreground">{p.name}</h2>
              {p.highlight && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                  Vitrin
                </span>
              )}
            </div>
            <p className="mt-2 text-accent">{formatPrice(p.priceFrom, p.currency)}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-muted">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
