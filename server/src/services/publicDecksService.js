const pool = require("../db/pool");

async function getPublicDeckBySlug(slug) {
  const deckResult = await pool.query(
    `
    SELECT id, title, description, public_slug, is_public, created_at, updated_at
    FROM decks
    WHERE public_slug = $1 AND is_public = true
    `,
    [slug],
  );

  const deck = deckResult.rows[0];

  if (!deck) {
    const error = new Error("Public deck not found.");
    error.statusCode = 404;
    throw error;
  }

  const cardsResult = await pool.query(
    `
    SELECT id, front, back, example, note, order_index
    FROM cards
    WHERE deck_id = $1
    ORDER BY order_index ASC
    `,
    [deck.id],
  );

  return {
    ...deck,
    cards: cardsResult.rows,
  };
}

module.exports = {
  getPublicDeckBySlug,
};
