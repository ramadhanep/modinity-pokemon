#!/usr/bin/env bash

set -euo pipefail

# Simple deployment helper for pokemon-fe (Nuxt 4 SSR) Docker image + container.
# Usage:
#   chmod +x ./deploy-fe.sh
#   ./deploy-fe.sh
#
# You can override defaults via env vars, e.g.:
#   IMAGE_NAME=pokemon-fe CONTAINER_NAME=pokemon-fe PORT=3000 MODINITY_POKEMON_API_BASE=https://api.example.com/api ./deploy-fe.sh

: "${IMAGE_NAME:=pokemon-fe}"
: "${CONTAINER_NAME:=pokemon-fe}"
: "${PORT:=3000}"

REPO_ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
FE_DIR="$REPO_ROOT_DIR/pokemon-fe"

echo "[deploy-fe] Image:        $IMAGE_NAME"
echo "[deploy-fe] Container:    $CONTAINER_NAME"
echo "[deploy-fe] Host port:    $PORT"
echo "[deploy-fe] Frontend dir: $FE_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[error] Docker is not installed or not in PATH." >&2
  exit 1
fi

echo "[deploy-fe] Building Docker image..."
docker build -t "$IMAGE_NAME" "$FE_DIR"

# Stop and remove existing container if present
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "[deploy-fe] Stopping existing container $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME" >/dev/null || true
  echo "[deploy-fe] Removing existing container $CONTAINER_NAME..."
  docker rm "$CONTAINER_NAME" >/dev/null || true
fi

# Compose env flags
ENV_FLAGS=("-e" "NITRO_PORT=3000" "-e" "NITRO_HOST=0.0.0.0")
if [[ -n "${MODINITY_POKEMON_API_BASE:-}" ]]; then
  ENV_FLAGS+=("-e" "MODINITY_POKEMON_API_BASE=${MODINITY_POKEMON_API_BASE}")
fi

echo "[deploy-fe] Starting container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:3000" \
  "${ENV_FLAGS[@]}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "[deploy-fe] Done. App should be reachable on http://localhost:$PORT/"

