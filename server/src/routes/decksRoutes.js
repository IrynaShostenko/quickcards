const express = require("express");
const { createDeck } = require("../controllers/decksController");

const router = express.Router();

router.post("/", createDeck);

module.exports = router;