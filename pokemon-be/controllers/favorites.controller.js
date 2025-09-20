const { sendSuccess, sendError, sendInternalError } = require("../utils/responses");
const Favorites = require("../models/favorites.model");

/** GET /api/favorites */
function listFavorites(_req, res) {
  try {
    const rows = Favorites.listFavorites();
    return sendSuccess(res, rows);
  } catch (err) {
    return sendInternalError(res, err, "listFavorites");
  }
}

/** POST /api/favorites */
function createFavorite(req, res) {
  const { pokemonId, name, sprite, types } = req.body || {};

  // basic validation
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
    const favorite = Favorites.createFavorite({ pokemonId, name, sprite, types });
    return sendSuccess(res, favorite, 201);
  } catch (err) {
    // unique constraint -> already favorited
    if (
      err &&
      typeof err.message === "string" &&
      err.message.includes("UNIQUE")
    ) {
      return sendError(res, 400, "Pokemon already favorited", "DUPLICATE");
    }
    return sendInternalError(res, err, "createFavorite");
  }
}

/** DELETE /api/favorites/:id */
function deleteFavorite(req, res) {
  const id = Number(req.params.id);
  if (!id) {
    return sendError(res, 400, "id required", "VALIDATION");
  }

  try {
    const changes = Favorites.deleteFavoriteById(id);
    if (changes === 0) {
      return sendError(res, 404, "not found", "NOT_FOUND");
    }
    return sendSuccess(res, { success: true });
  } catch (err) {
    return sendInternalError(res, err, "deleteFavorite");
  }
}

module.exports = {
  listFavorites,
  createFavorite,
  deleteFavorite,
};
