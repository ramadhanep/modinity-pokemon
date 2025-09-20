const db = require("../db");

function toTeamMember(row) {
  return {
    ...row,
    types: row?.types ? JSON.parse(row.types) : [],
  };
}

function listTeamMembers() {
  const rows = db
    .prepare("SELECT * FROM team_members ORDER BY created_at ASC")
    .all();
  return rows.map(toTeamMember);
}

function createTeamMember({ pokemonId, name, sprite, types }) {
  const tx = db.transaction(() => {
    const count = db.prepare("SELECT COUNT(*) AS c FROM team_members").get().c;
    if (count >= 6) {
      // keep consistent with current controller handling
      const e = new Error("TEAM_FULL");
      throw e;
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

    const row = db
      .prepare("SELECT * FROM team_members WHERE id = ?")
      .get(info.lastInsertRowid);
    return toTeamMember(row);
  });

  return tx();
}

function deleteTeamMemberById(id) {
  const info = db.prepare("DELETE FROM team_members WHERE id = ?").run(Number(id));
  return info.changes;
}

module.exports = {
  listTeamMembers,
  createTeamMember,
  deleteTeamMemberById,
};

