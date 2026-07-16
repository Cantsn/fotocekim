import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { getInquiries } from "@/lib/data";
import { updateInquiryStatusAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  QUOTED: "Teklif",
  CONFIRMED: "Onay",
  CANCELLED: "İptal",
};

export default async function AdminRandevularPage() {
  await guardAdminPage("inquiries");
  const inquiries = await getInquiries();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Randevular / Mesajlar</h1>
          <p className="mt-2 text-sm text-muted">
            Durumu <strong className="text-foreground">Onay</strong> yapınca
            seçilen tarih+saat sitede dolu olur.
          </p>
        </div>
        <Link
          href="/admin/takvim"
          className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground hover:border-accent"
        >
          Takvim görünümü →
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted-bg text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">İletişim</th>
              <th className="px-4 py-3 font-medium">Çekim slotu</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Talep</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Kayıt yok
                </td>
              </tr>
            ) : (
              inquiries.map((i) => (
                <tr key={i.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="text-foreground">{i.name}</p>
                    <p className="mt-1 max-w-xs text-xs text-muted line-clamp-2">
                      {i.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {i.type}
                      {i.source ? ` · ${i.source}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <div>{i.phone}</div>
                    {i.email && <div className="text-xs">{i.email}</div>}
                    {i.location && (
                      <div className="text-xs">{i.location}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    {i.eventDate ? (
                      <>
                        <div className="font-medium">
                          {i.eventDate}
                          {i.eventTime ? ` · ${i.eventTime}` : ""}
                        </div>
                        {i.status === "CONFIRMED" && (
                          <span className="mt-1 inline-block text-[10px] text-success">
                            Slot kilitli
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={updateInquiryStatusAction}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <input type="hidden" name="id" value={i.id} />
                      <select
                        name="status"
                        defaultValue={i.status}
                        className="rounded-lg border border-border bg-muted-bg px-2 py-1 text-xs"
                      >
                        {Object.entries(statusLabel).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs text-accent hover:underline"
                      >
                        Kaydet
                      </button>
                    </form>
                    {i.status === "CONFIRMED" && (
                      <p className="mt-2 max-w-[12rem] text-[10px] text-muted">
                        Onay, aynı tarih/saat müsait değilse uygulanmaz.
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {new Date(i.createdAt).toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
