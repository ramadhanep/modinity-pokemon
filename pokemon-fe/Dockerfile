FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the app and build
COPY . .
ENV NODE_ENV=production
RUN npm run build

# --- Runtime image ---
FROM node:20-slim AS runner
WORKDIR /app

# Nuxt/Nitro server listens on PORT/NITRO_PORT, default 3000
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000 \
    PORT=3000

# Copy the built output only (contains the standalone server)
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

