FROM node:20-slim

# Install build deps for native modules like better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Runtime env
ENV NODE_ENV=production \
    PORT=3001 \
    SQLITE_DIR=/data

# Ensure data dir exists (mounted as a volume in run/deploy)
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3001

CMD ["npm", "start"]

