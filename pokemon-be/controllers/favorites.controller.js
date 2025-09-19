// controllers/favorites.controller.js
const db = require("../db");

/** Transform a DB row to API shape (parse JSON fields) */
function toFavorite(row) {
  return {
    ...row,
    types: row?.types ? JSON.parse(row.types) : [],
  };
}

/** GET /api/favorites */
function listFavorites(_req, res) {
  try {
    const rows = db
      .prepare("SELECT * FROM favorites ORDER BY created_at DESC")
      .all();
    return res.json(rows.map(toFavorite));
  } catch (err) {
    console.error("listFavorites error:", err);
    return res.status(500).json({ error: "internal", code: "INTERNAL_ERROR" });
  }
}

/** POST /api/favorites */
function createFavorite(req, res) {
  const { pokemonId, name, sprite, types } = req.body || {};

  // basic validation
  if (!pokemonId || !name) {
    return res
      .status(400)
      .json({ error: "pokemonId and name required", code: "VALIDATION" });
  }
  if (types && !Array.isArray(types)) {
    return res
      .status(400)
      .json({ error: "types must be an array of strings", code: "VALIDATION" });
  }

  try {
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
    return res.status(201).json(toFavorite(row));
  } catch (err) {
    // unique constraint -> already favorited
    if (
      err &&
      typeof err.message === "string" &&
      err.message.includes("UNIQUE")
    ) {
      return res
        .status(400)
        .json({ error: "Pokemon already favorited", code: "DUPLICATE" });
    }
    console.error("createFavorite error:", err);
    return res.status(500).json({ error: "internal", code: "INTERNAL_ERROR" });
  }
}

/** DELETE /api/favorites/:id */
function deleteFavorite(req, res) {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "id required", code: "VALIDATION" });
  }

  try {
    const info = db.prepare("DELETE FROM favorites WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "not found", code: "NOT_FOUND" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteFavorite error:", err);
    return res.status(500).json({ error: "internal", code: "INTERNAL_ERROR" });
  }
}

module.exports = {
  listFavorites,
  createFavorite,
  deleteFavorite,
};
