#!/bin/sh
set -e

echo "==> FotoCekim: veritabanı hazırlanıyor..."
mkdir -p /data

# Schema uygula (SQLite dosyası yoksa oluşturur)
./node_modules/.bin/prisma db push --skip-generate

# İlk kurulumda seed (boşsa — seed.ts kendi kontrol eder)
./node_modules/.bin/tsx prisma/seed.ts

echo "==> Uygulama başlatılıyor..."
exec "$@"
