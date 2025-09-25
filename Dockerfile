# --- Build stage ---
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
    
# Instalar dependencias
COPY package*.json ./
RUN npm ci
    
# Copiar código
COPY . .
    
# Inyectar la URL del backend en build (visible en el navegador)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
    
# Compilar
RUN npm run build
    
# --- Runtime stage ---
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
RUN apk add --no-cache libc6-compat && addgroup -S nodejs && adduser -S nodeuser -G nodejs
WORKDIR /app
    
ENV NODE_ENV=production
ENV PORT=8000
    
# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev
    
# Copiar artefactos de build y estáticos
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# (opcional pero útil) copia la config de Next si la usas
COPY --from=builder /app/next.config.* ./
    
USER nodeuser
EXPOSE 8000
    
# Asegura puerto 8000 (respeta $PORT si lo cambias)
CMD ["sh","-lc","npx next start -p ${PORT:-8000}"]
    