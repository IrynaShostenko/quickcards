import { supabase } from "../supabaseClient";

export async function saveDeckWithCards({
  existingDeckId,
  title,
  description,
  cards,
}) {
  const deckPayload = {
    title,
    description,
    is_public: true,
  };

  let savedDeck;

  if (existingDeckId) {
    const { data, error } = await supabase
      .from("decks")
      .update(deckPayload)
      .eq("id", existingDeckId)
      .select("id, title, description, is_public, created_at")
      .single();

    if (error) {
      throw error;
    }

    savedDeck = data;

    const { error: deleteCardsError } = await supabase
      .from("cards")
      .delete()
      .eq("deck_id", existingDeckId);

    if (deleteCardsError) {
      throw deleteCardsError;
    }
  } else {
    const { data, error } = await supabase
      .from("decks")
      .insert(deckPayload)
      .select("id, title, description, is_public, created_at")
      .single();

    if (error) {
      throw error;
    }

    savedDeck = data;
  }

  const cardRows = cards.map((card, index) => ({
    deck_id: savedDeck.id,
    front: card.front,
    back: card.back,
    example: card.example || "",
    note: card.note || "",
    order_index: index,
  }));

  if (cardRows.length) {
    const { error: cardsError } = await supabase.from("cards").insert(cardRows);

    if (cardsError) {
      throw cardsError;
    }
  }

  return savedDeck;
}
