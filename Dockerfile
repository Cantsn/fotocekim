# syntax=docker/dockerfile:1
# Coolify / tek-container: Next.js standalone + SQLite (slim image)

# --- deps ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma

# --ignore-scripts: Coolify / production NODE_ENV ile postinstall kırılmasın
RUN npm ci --ignore-scripts \
  && npx prisma generate

# --- build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

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

# Runtime-only tools (prisma CLI + seed) — full node_modules yok
FROM node:22-bookworm-slim AS tools
WORKDIR /tools
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY prisma ./prisma
# Sadece entrypoint seed/db için gereken paketler
RUN npm init -y >/dev/null 2>&1 \
  && npm install --omit=dev --no-fund \
    prisma@6.19.3 \
    @prisma/client@6.19.3 \
    tsx@4.23.1 \
    bcryptjs@3.0.3 \
  && npx prisma generate

# --- runner (slim) ---
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
ENV UPLOAD_DIR=/data/uploads
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP
ENV ADMIN_EMAIL=$ADMIN_EMAIL
ENV ADMIN_PASSWORD=$ADMIN_PASSWORD
# seed için tools node_modules
ENV NODE_PATH=/tools/node_modules
ENV PATH="/tools/node_modules/.bin:${PATH}"

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /data /data/uploads \
  && chown -R nextjs:nodejs /data

# Standalone app (traced deps only — no full monorepo node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# seed imports ../lib/permissions
COPY --from=builder --chown=nextjs:nodejs /app/lib/permissions.ts ./lib/permissions.ts
COPY --from=tools --chown=nextjs:nodejs /tools /tools

COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
VOLUME ["/data"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
