import { apiRequest } from "./httpClient";

function mapDeckFromApi(deck) {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    public_slug: deck.public_slug,
    is_public: deck.is_public,
    created_at: deck.created_at,
    updated_at: deck.updated_at,
    cards: (deck.cards || []).map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      example: card.example || "",
      note: card.note || "",
      order_index: card.order_index,
    })),
  };
}

function mapDeckSummaryFromApi(deck) {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description || "",
    public_slug: deck.public_slug,
    is_public: deck.is_public,
    created_at: deck.created_at,
    updated_at: deck.updated_at,
    cards_count: deck.cards_count || 0,
  };
}

export async function getDecksList() {
  const data = await apiRequest("/decks");

  return (data.decks || []).map(mapDeckSummaryFromApi);
}

export async function getDeckById(deckId) {
  const data = await apiRequest(`/decks/${deckId}`);

  return mapDeckFromApi(data.deck);
}

export async function saveDeckWithCards({
  existingDeckId,
  title,
  description,
  cards,
}) {
  const payload = {
    title,
    description,
    cards,
  };

  if (existingDeckId) {
    const data = await apiRequest(`/decks/${existingDeckId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return mapDeckFromApi(data.deck);
  }

  const data = await apiRequest("/decks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapDeckFromApi(data.deck);
}

export async function deleteDeck(deckId) {
  return apiRequest(`/decks/${deckId}`, {
    method: "DELETE",
  });
}