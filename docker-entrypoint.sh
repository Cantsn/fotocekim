#!/bin/sh
set -e

echo "==> FotoCekim: veritabanı ve yüklemeler hazırlanıyor..."
mkdir -p /data /data/uploads

# Slim image: prisma/tsx tools stage'te (/tools)
PRISMA_BIN="${PRISMA_BIN:-/tools/node_modules/.bin/prisma}"
TSX_BIN="${TSX_BIN:-/tools/node_modules/.bin/tsx}"

if [ ! -x "$PRISMA_BIN" ]; then
  echo "HATA: prisma bulunamadı ($PRISMA_BIN)"
  exit 1
fi

# Schema uygula (SQLite dosyası yoksa oluşturur)
# --accept-data-loss: şema güncellemelerinde eski volume DB bloklanmasın
"$PRISMA_BIN" db push --schema=/app/prisma/schema.prisma --skip-generate --accept-data-loss

# Owner + boşsa içerik seed
if [ -x "$TSX_BIN" ]; then
  "$TSX_BIN" /app/prisma/seed.ts
else
  echo "Uyarı: tsx yok, seed atlandı"
fi

echo "==> Uygulama başlatılıyor..."
exec "$@"
