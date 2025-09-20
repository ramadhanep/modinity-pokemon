const { sendSuccess, sendError, sendInternalError } = require("../utils/responses");
const Team = require("../models/team.model");

/** GET /api/team */
function listTeam(_req, res) {
  try {
    const rows = Team.listTeamMembers();
    return sendSuccess(res, rows);
  } catch (err) {
    return sendInternalError(res, err, "listTeam");
  }
}

/** POST /api/team  (max 6, unique) */
function addTeamMember(req, res) {
  const { pokemonId, name, sprite, types } = req.body || {};

  // validation
  if (!pokemonId || !name) {
    return sendError(res, 400, "pokemonId and name required", "VALIDATION");
  }
  if (types && !Array.isArray(types)) {
    return sendError(
      res,
      400,
      "types must be an array of strings",
      "VALIDATION"
    );
  }

  try {
    const member = Team.createTeamMember({ pokemonId, name, sprite, types });
    return sendSuccess(res, member, 201);
  } catch (err) {
    // duplicate unique constraint
    if (
      err &&
      typeof err.message === "string" &&
      err.message.includes("UNIQUE")
    ) {
      return sendError(res, 400, "Pokemon already in team", "DUPLICATE");
    }
    // team full custom error
    if (err && err.message === "TEAM_FULL") {
      return sendError(res, 400, "Team is full (max 6)", "TEAM_FULL");
    }
    return sendInternalError(res, err, "addTeamMember");
  }
}

/** DELETE /api/team/:id */
function removeTeamMember(req, res) {
  const id = Number(req.params.id);
  if (!id) {
    return sendError(res, 400, "id required", "VALIDATION");
  }

  try {
    const changes = Team.deleteTeamMemberById(id);
    if (changes === 0) {
      return sendError(res, 404, "not found", "NOT_FOUND");
    }
    return sendSuccess(res, { success: true });
  } catch (err) {
    return sendInternalError(res, err, "removeTeamMember");
  }
}

module.exports = {
  listTeam,
  addTeamMember,
  removeTeamMember,
};
