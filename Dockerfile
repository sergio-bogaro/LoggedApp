# ──────────────────────────────────────────────
# Estágio 1 — build do frontend (Vite)
# ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variáveis do Vite são embutidas em tempo de build.
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_TMDB_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY

RUN npm run build

# ──────────────────────────────────────────────
# Estágio 2 — serve o dist/ com Nginx
# ──────────────────────────────────────────────
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
