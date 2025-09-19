const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.SQLITE_DIR || path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DATABASE_URL || path.join(DATA_DIR, "pokemon.db");
const db = new Database(DB_PATH);

// enforce foreign keys
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pokemon_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sprite TEXT,
  types TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pokemon_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sprite TEXT,
  types TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
