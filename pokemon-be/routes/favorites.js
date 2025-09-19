const express = require("express");
const {
  listFavorites,
  createFavorite,
  deleteFavorite,
} = require("../controllers/favorites.controller");

const router = express.Router();

router.get("/", listFavorites);
router.post("/", createFavorite);
router.delete("/:id", deleteFavorite);

module.exports = router;
