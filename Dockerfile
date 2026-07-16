# syntax=docker/dockerfile:1
# Coolify / tek-container: Next.js + SQLite

# --- deps ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Coolify ARG enjekte edebilir; npm ci devDependencies da kursun
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# postinstall / prisma generate için şema (ignore-scripts ile yine de güvenli)
COPY prisma ./prisma

# --ignore-scripts: schema yokken / production NODE_ENV ile postinstall kırılmasın
RUN npm ci --ignore-scripts \
  && npx prisma generate

# --- build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Coolify build-arg'ları (NEXT_PUBLIC_* build zamanında gerekir)
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_NAME=FotoCekim
ARG NEXT_PUBLIC_WHATSAPP=905000000000
ARG ADMIN_EMAIL=admin@fotocekim.com
ARG ADMIN_PASSWORD=admin123

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP
ENV ADMIN_EMAIL=$ADMIN_EMAIL
ENV ADMIN_PASSWORD=$ADMIN_PASSWORD
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Build sırasında geçici SQLite
ENV DATABASE_URL="file:./build.db"

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY . .

RUN npx prisma generate \
  && npx prisma db push --skip-generate \
  && npx tsx prisma/seed.ts \
  && npx next build

# --- runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_NAME=FotoCekim
ARG NEXT_PUBLIC_WHATSAPP=905000000000
ARG ADMIN_EMAIL=admin@fotocekim.com
ARG ADMIN_PASSWORD=admin123

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/data/fotocekim.db"
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP
ENV ADMIN_EMAIL=$ADMIN_EMAIL
ENV ADMIN_PASSWORD=$ADMIN_PASSWORD

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
  && mkdir -p /data \
  && chown -R nextjs:nodejs /app /data

USER nextjs
EXPOSE 3000
VOLUME ["/data"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
