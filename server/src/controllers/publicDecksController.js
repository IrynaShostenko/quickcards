const { getPublicDeckBySlug } = require("../services/publicDecksService");

async function getPublicDeck(req, res) {
  try {
    const { slug } = req.params;

    const deck = await getPublicDeckBySlug(slug);

    return res.json({ deck });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not load public deck.",
    });
  }
}

module.exports = {
  getPublicDeck,
};
