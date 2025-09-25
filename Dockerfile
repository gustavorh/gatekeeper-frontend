# --- Build stage ---
    FROM public.ecr.aws/docker/library/node:20-alpine AS builder
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    COPY package*.json ./
    # Si el repo no tiene package-lock.json, npm ci falla. Este bloque lo maneja:
    RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
    
    COPY . .
    
    # Llega desde build args
    ARG NEXT_PUBLIC_API_URL
    ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    
    # Diagnóstico visible en Portainer
    RUN echo ">> Building with NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
     && [ -n "$NEXT_PUBLIC_API_URL" ] || (echo "ERROR: NEXT_PUBLIC_API_URL vacío"; exit 2)
    
    RUN node -v && npm -v
    RUN npm run build
    
    # --- Runtime stage ---
    FROM public.ecr.aws/docker/library/node:20-alpine AS runner
    RUN apk add --no-cache libc6-compat && addgroup -S nodejs && adduser -S nodeuser -G nodejs
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=8000
    
    COPY package*.json ./
    RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
    
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.* ./
    
    USER nodeuser
    EXPOSE 8000
    CMD ["sh","-lc","npx next start -p ${PORT:-8000}"]    