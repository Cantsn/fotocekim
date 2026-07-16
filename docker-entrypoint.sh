#!/bin/sh
set -e

echo "==> FotoCekim: veritabanı ve yüklemeler hazırlanıyor..."
mkdir -p /data /data/uploads

# Schema uygula (SQLite dosyası yoksa oluşturur)
./node_modules/.bin/prisma db push --skip-generate

# Owner + boşsa içerik seed
./node_modules/.bin/tsx prisma/seed.ts

echo "==> Uygulama başlatılıyor..."
exec "$@"
