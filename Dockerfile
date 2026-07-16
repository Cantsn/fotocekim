# syntax=docker/dockerfile:1

# --- deps ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time dummy DB (runtime uses /data volume)
ENV DATABASE_URL="file:./build.db"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate \
  && npx prisma db push --skip-generate \
  && npx tsx prisma/seed.ts \
  && npx next build

# --- runner (tek container: Next.js + SQLite) ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/data/fotocekim.db"

# Standalone Next server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Full node_modules (Prisma CLI + engines + tsx for seed on boot)
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
