import { apiRequest } from "./httpClient";

export async function getPublicDeck(slug) {
  const data = await apiRequest(`/public/decks/${slug}`);

  return {
    id: data.deck.id,
    title: data.deck.title,
    description: data.deck.description,
    publicSlug: data.deck.public_slug,
    createdAt: data.deck.created_at,
    cards: (data.deck.cards || []).map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      example: card.example || "",
      note: card.note || "",
    })),
  };
}
