# Pokemon Backend (Express + SQLite)

Backend for Modinity Pokemon. Small, fast Express API with SQLite storage and a simple models layer.

## Stack

- Express 5, CORS
- better-sqlite3 (embedded, fast, sync)
- Swagger UI at `/docs` (served from `openapi.json`)
- Models bridge controllers ↔ DB (`pokemon-be/models/*`)
- Unified responses helper (`pokemon-be/utils/responses.js`)
- Tests: Jest + Supertest (in-memory SQLite)
- Docker support

## Endpoints

- `GET /` – health/info
- Favorites
  - `GET /api/favorites`
  - `POST /api/favorites` – body: `{ pokemonId, name, sprite?, types? }`
  - `DELETE /api/favorites/:id`
- Team
  - `GET /api/team`
  - `POST /api/team` – max 6 unique members
  - `DELETE /api/team/:id`

Errors are normalized: `{ error: string, code: string }`.

## Run locally

Requirements: Node 18/20

```bash
cd pokemon-be
npm install
npm run dev # http://localhost:3001
```

Environment variables:

- `PORT` (default `3001`)
- `SQLITE_DIR` (directory to store DB file; default `pokemon-be/data`)
- `DATABASE_URL` – optional, set to `:memory:` for ephemeral in‑memory DB (tests)

## Tests

```bash
cd pokemon-be
npm install
npm test
```

Uses in‑memory SQLite; schema is created automatically by `db.js`.

## Docker

```bash
cd pokemon-be
docker build -t pokemon-be .
docker volume create pokemon_data
docker run -d --name pokemon-be \
  -p 3001:3001 \
  -v pokemon_data:/data \
  -e SQLITE_DIR=/data \
  --restart unless-stopped \
  pokemon-be
```

Or from repo root:

```bash
./deploy-be.sh
```