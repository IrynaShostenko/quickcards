const { createDeckWithCards } = require("../services/decksService");

async function createDeck(req, res) {
  try {
    const { title, description = "", cards = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required.",
      });
    }

    const deck = await createDeckWithCards({
      title,
      description,
      cards,
    });

    return res.status(201).json({ deck });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not create deck.",
    });
  }
}

module.exports = {
  createDeck,
};