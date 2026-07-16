import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export default function AdminMedyaPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Medya kütüphanesi</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Fotoğraf yükleme (Cloudinary / S3) bir sonraki fazda bağlanacak. Şimdilik gri
        yer tutucular — siz gerçek dosyaları eklediğinizde bu alanlar dolacak.
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted">Sürükle-bırak yükleme yakında</p>
        <p className="mt-2 text-xs text-muted">
          Desteklenecek: JPG, PNG, WebP, MP4 · max boyut yapılandırılabilir
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MediaPlaceholder key={i} label={`Boş slot ${i + 1}`} aspect="square" />
        ))}
      </div>
    </div>
  );
}
