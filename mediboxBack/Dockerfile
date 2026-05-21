# ─── Stage 1: build ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ─── Stage 2: produção ──────────────────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# instala dependências runtime
COPY package*.json ./
RUN npm ci --omit=dev

# instala netcat (necessário para esperar o Postgres)
RUN apk add --no-cache netcat-openbsd

# copia build
COPY --from=builder /app/dist ./dist

# copia scripts (IMPORTANTE)
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# entrypoint (RODA MIGRATION + START)
CMD ["sh", "docker-entrypoint.sh"]