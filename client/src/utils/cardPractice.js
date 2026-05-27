export function shuffleCards(cards) {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function insertCardLater(queue, card, currentIndex) {
  if (!queue.length) return [card];

  const minOffset = 2;
  const maxOffset = Math.min(4, queue.length + 1);
  const offset =
    Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  const insertIndex = Math.min(currentIndex + offset, queue.length);

  return [...queue.slice(0, insertIndex), card, ...queue.slice(insertIndex)];
}
