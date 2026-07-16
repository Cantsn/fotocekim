#!/bin/sh
set -e

echo "==> FotoCekim: veritabanı ve yüklemeler hazırlanıyor..."
mkdir -p /data /data/uploads

# Schema uygula (SQLite dosyası yoksa oluşturur)
# --accept-data-loss: şema güncellemelerinde kaldırılan kolonlar (örn. galleryCount)
# eski volume DB'lerinde push'un bloklanmaması için gerekli
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss

# Owner + boşsa içerik seed
./node_modules/.bin/tsx prisma/seed.ts

echo "==> Uygulama başlatılıyor..."
exec "$@"
