#!/usr/bin/env bash

set -euo pipefail

# Simple deployment helper for pokemon-be Docker image + container.
# Usage:
#   chmod +x ./deploy-be.sh
#   ./deploy-be.sh
#
# You can override defaults via env vars, e.g.:
#   IMAGE_NAME=my-pokemon-be CONTAINER_NAME=pokemon-be PORT=3001 ./deploy-be.sh

: "${IMAGE_NAME:=pokemon-be}"
: "${CONTAINER_NAME:=pokemon-be}"
: "${VOLUME_NAME:=pokemon_data}"
: "${PORT:=3001}"

DATA_DIR=/data
REPO_ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
BE_DIR="$REPO_ROOT_DIR/pokemon-be"

echo "[deploy] Image:        $IMAGE_NAME"
echo "[deploy] Container:    $CONTAINER_NAME"
echo "[deploy] Volume:       $VOLUME_NAME -> $DATA_DIR"
echo "[deploy] Host port:    $PORT"
echo "[deploy] Backend dir:  $BE_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[error] Docker is not installed or not in PATH." >&2
  exit 1
fi

# Build image
echo "[deploy] Building Docker image..."
docker build -t "$IMAGE_NAME" "$BE_DIR"

# Create persistent volume if missing
if ! docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
  echo "[deploy] Creating volume $VOLUME_NAME..."
  docker volume create "$VOLUME_NAME" >/dev/null
fi

# Stop and remove existing container if present
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "[deploy] Stopping existing container $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME" >/dev/null || true
  echo "[deploy] Removing existing container $CONTAINER_NAME..."
  docker rm "$CONTAINER_NAME" >/dev/null || true
fi

# Run container
echo "[deploy] Starting container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:3001" \
  -v "$VOLUME_NAME":"$DATA_DIR" \
  -e "SQLITE_DIR=$DATA_DIR" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "[deploy] Done. App should be reachable on http://localhost:$PORT/"
echo "[deploy] API docs is http://localhost:$PORT/docs"

