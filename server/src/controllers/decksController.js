const {
  getDecksList,
  getDeckById,
  createDeckWithCards,
  updateDeckWithCards,
  deleteDeckById,
} = require("../services/decksService");

async function getDecks(req, res) {
  try {
    const decks = await getDecksList(req.user.id);

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

    const deck = await getDeckById({
      deckId: id,
      teacherId: req.user.id,
    });

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
      teacherId: req.user.id,
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
      teacherId: req.user.id,
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

async function deleteDeck(req, res) {
  try {
    const deletedDeck = await deleteDeckById({
      deckId: req.params.id,
      teacherId: req.user.id,
    });

    return res.json({
      message: "Deck deleted successfully.",
      deck: deletedDeck,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not delete deck.",
    });
  }
}

module.exports = {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
};
