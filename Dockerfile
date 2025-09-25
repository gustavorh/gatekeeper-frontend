# --- Build stage ---
    FROM public.ecr.aws/docker/library/node:20-alpine AS builder
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    
    # Recoge el build arg; si no viene, usa un fallback explícito (mejor que vacío)
    ARG NEXT_PUBLIC_API_URL
    ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    
    # Log visible en Portainer para verificar que llegó la URL
    RUN echo ">> Building with NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"
    
    # Si llega vacío, aborta con mensaje útil
    RUN sh -c 'if [ -z "$NEXT_PUBLIC_API_URL" ]; then echo "ERROR: NEXT_PUBLIC_API_URL no definido"; exit 2; fi'
    
    RUN npm run build
    
    # --- Runtime stage ---
    FROM public.ecr.aws/docker/library/node:20-alpine AS runner
    RUN apk add --no-cache libc6-compat && addgroup -S nodejs && adduser -S nodeuser -G nodejs
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=8000
    
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.* ./
    
    USER nodeuser
    EXPOSE 8000
    CMD ["sh","-lc","npx next start -p ${PORT:-8000}"]