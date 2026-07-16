import { getInquiries } from "@/lib/data";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  QUOTED: "Teklif",
  CONFIRMED: "Onay",
  CANCELLED: "İptal",
};

export default async function AdminRandevularPage() {
  const inquiries = await getInquiries();

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Randevular / Mesajlar</h1>
      <p className="mt-2 text-sm text-muted">
        Form gönderileri SQLite veritabanında kalıcı olarak saklanır.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted-bg text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Kaynak</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
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
                  </td>
                  <td className="px-4 py-3 text-muted">{i.phone}</td>
                  <td className="px-4 py-3 text-muted">{i.type}</td>
                  <td className="px-4 py-3 text-muted">{i.source}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                      {statusLabel[i.status] ?? i.status}
                    </span>
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
