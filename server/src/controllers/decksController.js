const {
  getDecksList,
  getDeckById,
  createDeckWithCards,
  updateDeckWithCards,
} = require("../services/decksService");

async function getDecks(req, res) {
  try {
    const decks = await getDecksList();

    return res.json({ decks });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not load decks.",
    });
  }
}

async function getDeck(req, res) {
  try {
    const { id } = req.params;

    const deck = await getDeckById(id);

    return res.json({ deck });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not load deck.",
    });
  }
}

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

async function updateDeck(req, res) {
  try {
    const { id } = req.params;
    const { title, description = "", cards = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required.",
      });
    }

    const deck = await updateDeckWithCards({
      deckId: id,
      title,
      description,
      cards,
    });

    return res.json({ deck });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not update deck.",
    });
  }
}

module.exports = {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
};
