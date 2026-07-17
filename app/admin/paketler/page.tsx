import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import {
  formatDiscountBadge,
  formatPrice,
  formatPriceAmount,
  getAllPackages,
} from "@/lib/data";
import { deletePackageAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPaketlerPage() {
  await guardAdminPage("packages");
  const list = await getAllPackages();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Paketler</h1>
          <p className="mt-2 text-sm text-muted">
            Fiyat, indirim, özellik ve vitrin ayarları.
          </p>
        </div>
        <Link
          href="/admin/paketler/yeni"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          + Yeni paket
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-serif text-xl text-foreground">{p.name}</h2>
              <div className="flex flex-col items-end gap-1">
                {p.highlight && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                    Vitrin
                  </span>
                )}
                {formatDiscountBadge(p) && (
                  <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-700">
                    {formatDiscountBadge(p)}
                  </span>
                )}
              </div>
            </div>
            {p.hasDiscount && p.priceFrom != null ? (
              <div className="mt-2">
                <p className="text-sm text-muted line-through">
                  {formatPriceAmount(p.priceFrom, p.currency)}
                </p>
                <p className="text-accent">
                  {formatPrice(p.finalPrice, p.currency)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-accent">
                {formatPrice(p.priceFrom, p.currency)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted">
              {p.published ? "Yayında" : "Taslak"} · sıra {p.order}
            </p>
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {p.features.slice(0, 4).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="mt-5 flex gap-3">
              <Link
                href={`/admin/paketler/${p.id}`}
                className="text-xs text-accent hover:underline"
              >
                Düzenle
              </Link>
              <form action={deletePackageAction}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-xs text-danger hover:underline">
                  Sil
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
