const express = require("express");

const {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
} = require("../controllers/decksController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getDecks);
router.get("/:id", getDeck);
router.post("/", createDeck);
router.put("/:id", updateDeck);
router.delete("/:id", deleteDeck);

module.exports = router;
