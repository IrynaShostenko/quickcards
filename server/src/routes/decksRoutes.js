const express = require("express");
const {
  getDeck,
  createDeck,
  updateDeck,
} = require("../controllers/decksController");

const router = express.Router();

router.get("/:id", getDeck);
router.post("/", createDeck);
router.put("/:id", updateDeck);

module.exports = router;