import { supabase } from "../supabaseClient";

export async function getPublicDeck(deckId) {
  const { data: deckData, error: deckError } = await supabase
    .from("decks")
    .select("id, title, description, created_at")
    .eq("id", deckId)
    .eq("is_public", true)
    .single();

  if (deckError) {
    throw deckError;
  }

  const { data: cardsData, error: cardsError } = await supabase
    .from("cards")
    .select("id, front, back, example, note, order_index")
    .eq("deck_id", deckId)
    .order("order_index", { ascending: true });

  if (cardsError) {
    throw cardsError;
  }

  return {
    id: deckData.id,
    title: deckData.title,
    description: deckData.description,
    createdAt: deckData.created_at,
    cards: (cardsData || []).map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      example: card.example || "",
      note: card.note || "",
    })),
  };
}
