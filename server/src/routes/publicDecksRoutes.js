const express = require("express");
const { getPublicDeck } = require("../controllers/publicDecksController");

const router = express.Router();

router.get("/decks/:slug", getPublicDeck);

module.exports = router;