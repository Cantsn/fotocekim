# FotoCekim — Fotoğraf & Video Stüdyo Sitesi

Next.js 16.2 + Prisma (SQLite) + Admin panel.  
**Tek Docker container** içinde hem site hem veritabanı çalışır.

> Fotoğraf alanları şimdilik gri placeholder; sonra yüklenecek.

---

## Hızlı başlangıç (Docker — önerilen)

```bash
# Repo
git clone https://github.com/Cantsn/fotocekim.git
cd fotocekim

# Tek container: site + SQLite
docker compose up -d --build
```

Aç:

| | |
|--|--|
| Site | http://localhost:3000 |
| Admin | http://localhost:3000/admin/login |

**Varsayılan admin:** `admin@fotocekim.com` / `admin123`  
(Production’da mutlaka değiştirin — `docker-compose.yml` veya `.env`)

### Kalıcı veri

SQLite dosyası Docker volume `fotocekim-data` içinde (`/data/fotocekim.db`).  
Container silinse bile volume silinmedikçe randevular ve içerik kalır.

```bash
# Log
docker compose logs -f

# Durdur
docker compose down

# Veriyi de sil
docker compose down -v
```

### Ortam değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `ADMIN_EMAIL` | Admin e-posta | `admin@fotocekim.com` |
| `ADMIN_PASSWORD` | Admin şifre | `admin123` |
| `NEXT_PUBLIC_SITE_URL` | Public URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Marka adı | `FotoCekim` |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp (ülke kodlu) | `905000000000` |
| `DATABASE_URL` | (container içi) | `file:/data/fotocekim.db` |
| `PORT` | Host port | `3000` |

Örnek:

```bash
ADMIN_PASSWORD=guclu-sifre NEXT_PUBLIC_SITE_URL=https://ornek.com docker compose up -d --build
```

### Sadece Docker (compose olmadan)

```bash
docker build -t fotocekim .
docker run -d --name fotocekim \
  -p 3000:3000 \
  -v fotocekim-data:/data \
  -e ADMIN_PASSWORD=guclu-sifre \
  -e NEXT_PUBLIC_SITE_URL=https://ornek.com \
  fotocekim
```

---

## Yerel geliştirme

```bash
npm install
cp .env.example .env   # DATABASE_URL=file:./dev.db
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

| Script | |
|--------|--|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run db:push` | Şema → SQLite |
| `npm run db:seed` | İlk veriler |
| `npm run db:studio` | Prisma Studio |

---

## Özellikler

**Public**

- Ana sayfa, hizmetler (8 kategori), portföy + filtre, paketler
- Hakkımızda, SSS, iletişim / randevu formu
- WhatsApp butonu, KVKK sayfaları, sitemap / robots

**Admin** (`/admin`)

- Cookie oturum + route koruması (`proxy.ts`)
- Dashboard, randevu listesi (SQLite’a yazar), medya/portföy/hizmet/paket/ayarlar görünümü

**Veri**

- Prisma + **SQLite** (tek container için ideal)
- İlk açılışta otomatik `db push` + seed (boşsa)

---

## Stack

- Next.js 16.2 (App Router, `output: "standalone"`)
- React 19 · TypeScript · Tailwind CSS 4
- Prisma 6 · SQLite
- Docker multi-stage image

---

## Proje yapısı (özet)

```
app/(site)/     → Public sayfalar
app/admin/      → Admin panel
components/     → UI
lib/data.ts     → Prisma veri erişimi
prisma/         → schema + seed
Dockerfile      → Tek container
docker-compose.yml
```

---

## Notlar

1. **Şifreleri production’da değiştirin.**
2. Fotoğraflar henüz yok — gri placeholder’lar `MediaPlaceholder` bileşeni.
3. Admin CRUD formları ve dosya yükleme sonraki faz.
4. Bu proje `nextcan` monorepo’sundan ayrıdır; kendi GitHub reposu: **fotocekim**.
