export function createEmptyCard() {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `card-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    front: "",
    back: "",
    example: "",
    note: "",
  };
}

export function cleanCardsForSave(cards) {
  return cards
    .map((card) => ({
      ...card,
      front: card.front.trim(),
      back: card.back.trim(),
      example: card.example.trim(),
      note: card.note.trim(),
    }))
    .filter((card) => card.front && card.back);
}
