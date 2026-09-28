# ──────────────────────────────────────────────
# Estágio 1 — build do frontend (Vite)
# ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL vazio = URLs relativas (mesma origem). O Nginx do container
# faz proxy de /api, /auth e /uploads para o serviço `api`.
# Nenhuma chave de API é embutida: TMDB/IGDB são por usuário e ficam no backend.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ──────────────────────────────────────────────
# Estágio 2 — serve o dist/ com Nginx
# ──────────────────────────────────────────────
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
