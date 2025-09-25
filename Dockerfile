# ========= build =========
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

# ========= runtime =========
# Opción 1: standalone (recomendado si en next.config.js: output: 'standalone')
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
RUN apk add --no-cache wget
# Standalone
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=5s --retries=10 \
  CMD wget -qO- http://localhost:8000 || exit 1
# server.js es generado por Next en standalone
CMD ["node", "server.js"]

# ---- Opción 2 (alternativa): next start ----
# FROM node:20-alpine AS runtime
# WORKDIR /app
# ENV NODE_ENV=production
# ENV PORT=8000
# RUN apk add --no-cache wget
# COPY --from=build /app ./
# EXPOSE 8000
# HEALTHCHECK --interval=10s --timeout=5s --retries=10 \
#   CMD wget -qO- http://localhost:8000 || exit 1
# CMD ["npm", "run", "start", "--", "-p", "8000"]
