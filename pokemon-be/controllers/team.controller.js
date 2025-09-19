// controllers/team.controller.js
const db = require("../db");

/** Transform DB row -> API shape */
function toTeamMember(row) {
  return {
    ...row,
    types: row?.types ? JSON.parse(row.types) : [],
  };
}

/** GET /api/team */
function listTeam(_req, res) {
  try {
    const rows = db
      .prepare("SELECT * FROM team_members ORDER BY created_at ASC")
      .all();
    return res.json(rows.map(toTeamMember));
  } catch (err) {
    console.error("listTeam error:", err);
    return res.status(500).json({ error: "internal", code: "INTERNAL_ERROR" });
  }
}

/** POST /api/team  (max 6, unique) */
function addTeamMember(req, res) {
  const { pokemonId, name, sprite, types } = req.body || {};

  // validation
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
    // transaction: check count then insert
    const tx = db.transaction(() => {
      const count = db
        .prepare("SELECT COUNT(*) AS c FROM team_members")
        .get().c;
      if (count >= 6) {
        // throw to break transaction and bubble up
        throw new Error("TEAM_FULL");
      }

      const insert = db.prepare(
        "INSERT INTO team_members (pokemon_id, name, sprite, types) VALUES (?, ?, ?, ?)"
      );
      const info = insert.run(
        Number(pokemonId),
        String(name),
        sprite ? String(sprite) : null,
        types ? JSON.stringify(types) : null
      );

      return db
        .prepare("SELECT * FROM team_members WHERE id = ?")
        .get(info.lastInsertRowid);
    });

    const row = tx();
    return res.status(201).json(toTeamMember(row));
  } catch (err) {
    // duplicate unique constraint
    if (
      err &&
      typeof err.message === "string" &&
      err.message.includes("UNIQUE")
    ) {
      return res
        .status(400)
        .json({ error: "Pokemon already in team", code: "DUPLICATE" });
    }
    // team full custom error
    if (err && err.message === "TEAM_FULL") {
      return res
        .status(400)
        .json({ error: "Team is full (max 6)", code: "TEAM_FULL" });
    }
    console.error("addTeamMember error:", err);
    return res.status(500).json({ error: "internal", code: "INTERNAL_ERROR" });
  }
}

/** DELETE /api/team/:id */
function removeTeamMember(req, res) {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "id required", code: "VALIDATION" });
  }

  try {
    const info = db.prepare("DELETE FROM team_members WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "not found", code: "NOT_FOUND" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("removeTeamMember error:", err);
    return res.status(500).json({ error: "internal", code: "INTERNAL_ERROR" });
  }
}

module.exports = {
  listTeam,
  addTeamMember,
  removeTeamMember,
};
