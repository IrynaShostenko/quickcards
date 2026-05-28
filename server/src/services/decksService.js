const pool = require("../db/pool");
const { createPublicSlug } = require("../utils/slugify");

function cleanDeckCards(cards = []) {
  return cards
    .map((card) => ({
      front: String(card.front || "").trim(),
      back: String(card.back || "").trim(),
      example: String(card.example || "").trim(),
      note: String(card.note || "").trim(),
    }))
    .filter((card) => card.front && card.back);
}

async function getDecksList() {
  const result = await pool.query(
    `
    SELECT
      decks.id,
      decks.title,
      decks.description,
      decks.public_slug,
      decks.is_public,
      decks.created_at,
      decks.updated_at,
      COUNT(cards.id)::INTEGER AS cards_count
    FROM decks
    LEFT JOIN cards ON cards.deck_id = decks.id
    GROUP BY decks.id
    ORDER BY decks.updated_at DESC
    `,
  );

  return result.rows;
}

async function getDeckById(deckId) {
  const deckResult = await pool.query(
    `
    SELECT id, title, description, public_slug, is_public, created_at, updated_at
    FROM decks
    WHERE id = $1
    `,
    [deckId],
  );

  const deck = deckResult.rows[0];

  if (!deck) {
    const error = new Error("Deck not found.");
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
    [deckId],
  );

  return {
    ...deck,
    cards: cardsResult.rows,
  };
}

async function createDeckWithCards({ title, description = "", cards = [] }) {
  const cleanCards = cleanDeckCards(cards);

  if (!cleanCards.length) {
    const error = new Error("At least one valid card is required.");
    error.statusCode = 400;
    throw error;
  }

  const publicSlug = createPublicSlug(title);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deckResult = await client.query(
      `
      INSERT INTO decks (teacher_id, title, description, public_slug, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, public_slug, is_public, created_at, updated_at
      `,
      [null, title.trim(), description.trim(), publicSlug, true],
    );

    const deck = deckResult.rows[0];
    const cardResults = [];

    for (const [index, card] of cleanCards.entries()) {
      const cardResult = await client.query(
        `
        INSERT INTO cards (deck_id, front, back, example, note, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, front, back, example, note, order_index
        `,
        [deck.id, card.front, card.back, card.example, card.note, index],
      );

      cardResults.push(cardResult.rows[0]);
    }

    await client.query("COMMIT");

    return {
      ...deck,
      cards: cardResults,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateDeckWithCards({
  deckId,
  title,
  description = "",
  cards = [],
}) {
  const cleanCards = cleanDeckCards(cards);

  if (!cleanCards.length) {
    const error = new Error("At least one valid card is required.");
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deckResult = await client.query(
      `
      UPDATE decks
      SET title = $1,
          description = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, title, description, public_slug, is_public, created_at, updated_at
      `,
      [title.trim(), description.trim(), deckId],
    );

    const deck = deckResult.rows[0];

    if (!deck) {
      const error = new Error("Deck not found.");
      error.statusCode = 404;
      throw error;
    }

    await client.query(
      `
      DELETE FROM cards
      WHERE deck_id = $1
      `,
      [deckId],
    );

    const cardResults = [];

    for (const [index, card] of cleanCards.entries()) {
      const cardResult = await client.query(
        `
        INSERT INTO cards (deck_id, front, back, example, note, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, front, back, example, note, order_index
        `,
        [deck.id, card.front, card.back, card.example, card.note, index],
      );

      cardResults.push(cardResult.rows[0]);
    }

    await client.query("COMMIT");

    return {
      ...deck,
      cards: cardResults,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteDeckById(deckId) {
  const result = await pool.query(
    `
    DELETE FROM decks
    WHERE id = $1
    RETURNING id
    `,
    [deckId],
  );

  if (!result.rows[0]) {
    const error = new Error("Deck not found.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  getDeckById,
  createDeckWithCards,
  updateDeckWithCards,
  deleteDeckById,
  getDecksList,
};
