import { apiRequest } from "./httpClient";

export async function saveDeckWithCards({
  existingDeckId,
  title,
  description,
  cards,
}) {
  if (existingDeckId) {
    throw new Error("Deck update is not connected yet.");
  }

  const data = await apiRequest("/decks", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      cards,
    }),
  });

  return data.deck;
}
