# syntax=docker/dockerfile:1
# Build context: root monorepo (lihat docker-compose.yml)

FROM oven/bun:1.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN bun install --frozen-lockfile --filter '@kdo/backend'

FROM deps AS build
COPY backend backend
WORKDIR /app/backend
RUN bun run build

FROM oven/bun:1.4-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Jakarta PORT=3000
RUN apk add --no-cache tzdata
# Hasil bundel sudah memuat seluruh dependensi; tidak perlu node_modules di runtime.
COPY --from=build --chown=bun:bun /app/backend/dist ./dist
COPY --chown=bun:bun backend/docker-entrypoint.sh ./docker-entrypoint.sh
USER bun
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
