const db = require("../db");

function toFavorite(row) {
  return {
    ...row,
    types: row?.types ? JSON.parse(row.types) : [],
  };
}

function listFavorites() {
  const rows = db
    .prepare("SELECT * FROM favorites ORDER BY created_at DESC")
    .all();
  return rows.map(toFavorite);
}

function createFavorite({ pokemonId, name, sprite, types }) {
  const stmt = db.prepare(
    "INSERT INTO favorites (pokemon_id, name, sprite, types) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(
    Number(pokemonId),
    String(name),
    sprite ? String(sprite) : null,
    types ? JSON.stringify(types) : null
  );

  const row = db
    .prepare("SELECT * FROM favorites WHERE id = ?")
    .get(info.lastInsertRowid);
  return toFavorite(row);
}

function deleteFavoriteById(id) {
  const info = db.prepare("DELETE FROM favorites WHERE id = ?").run(Number(id));
  return info.changes;
}

module.exports = {
  listFavorites,
  createFavorite,
  deleteFavoriteById,
};

