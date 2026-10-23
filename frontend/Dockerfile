# ============================================================
# Frontend - React + Vite servido por nginx
# Etapa 1 compila o React; etapa 2 so leva os arquivos estaticos.
# ============================================================

# ---------- Etapa 1: build ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# A API e chamada pelo mesmo endereco do site, no caminho /api.
# Quem encaminha para o backend e o nginx (ver nginx/default.conf.template).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: servidor web ----------
FROM nginx:1.27-alpine

# Valor padrao; no Kubernetes vem do ConfigMap
ENV BACKEND_URL=http://backend:3000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
