const express = require("express");
const {
  listTeam,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/team.controller");

const router = express.Router();

router.get("/", listTeam);
router.post("/", addTeamMember);
router.delete("/:id", removeTeamMember);

module.exports = router;
