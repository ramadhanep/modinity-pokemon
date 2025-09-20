# Pokemon Frontend (Nuxt 4 + Tailwind)

SSR Nuxt app for Modinity Pokemon.

## Stack

- Nuxt 4 (Nitro), Vue 3
- TailwindCSS, @nuxt/icon
- Runtime config for API base
- Docker support

## Runtime Config

The backend base URL is read from `runtimeConfig.public.apiBase`.

Set via env var `MODINITY_POKEMON_API_BASE`:

```bash
MODINITY_POKEMON_API_BASE=https://api.example.com/api
```

## Develop

```bash
cd pokemon-fe
npm install
npm run dev # http://localhost:3000
```

## Build & Run

```bash
npm run build
npm run preview
```

## Docker

Build and run (SSR server on port 3000):

```bash
cd pokemon-fe
docker build -t pokemon-fe .
docker run -d --name pokemon-fe \
  -p 3000:3000 \
  -e MODINITY_POKEMON_API_BASE="https://api.example.com/api" \
  --restart unless-stopped \
  pokemon-fe
```

Or from repo root:

```bash
MODINITY_POKEMON_API_BASE="https://api.example.com/api" ./deploy-fe.sh
```