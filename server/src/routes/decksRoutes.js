const express = require("express");
const { createDeck, updateDeck } = require("../controllers/decksController");

const router = express.Router();

router.post("/", createDeck);
router.put("/:id", updateDeck);

module.exports = router;
