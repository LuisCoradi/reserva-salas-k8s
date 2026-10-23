# ============================================================
# Backend - API de Reserva de Salas (Node.js + TypeScript + Prisma)
# Build em duas etapas: a imagem final leva so o JavaScript
# compilado e as dependencias de producao.
# ============================================================

# ---------- Etapa 1: build ----------
FROM node:24-alpine AS build
WORKDIR /app

# Dependencias primeiro (aproveita o cache de camadas do Docker)
COPY package*.json ./
COPY prisma ./prisma/
# O "postinstall" do package.json roda "prisma generate"
RUN npm ci

# Codigo-fonte e compilacao TypeScript -> dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build \
 && npm prune --omit=dev

# ---------- Etapa 2: execucao ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Nao roda como root dentro do container
USER node

# A porta real vem da variavel PORT (ConfigMap no Kubernetes)
EXPOSE 3000
CMD ["node", "dist/server.js"]
