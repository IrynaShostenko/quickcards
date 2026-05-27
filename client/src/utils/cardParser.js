export const TERM_DELIMITERS = {
  tab: "\t",
  comma: ",",
  custom: "custom",
};

export const CARD_DELIMITERS = {
  newline: "\n",
  semicolon: ";",
  custom: "custom",
};

export function getDelimiter(type, customValue, dictionary) {
  if (type === "custom") return customValue || "\t";
  return dictionary[type] || "\t";
}

export function insertTextAtCursor(event, textToInsert) {
  const textarea = event.currentTarget;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const nextValue = value.slice(0, start) + textToInsert + value.slice(end);

  return {
    value: nextValue,
    cursorPosition: start + textToInsert.length,
  };
}

export function parseCards(raw, settings) {
  const termDelimiter = getDelimiter(
    settings.termDelimiter,
    settings.customTermDelimiter,
    TERM_DELIMITERS,
  );

  const cardDelimiter = getDelimiter(
    settings.cardDelimiter,
    settings.customCardDelimiter,
    CARD_DELIMITERS,
  );

  return raw
    .split(cardDelimiter)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [front = "", back = "", example = "", note = ""] = line
        .split(termDelimiter)
        .map((item) => item.trim());

      return {
        id: `card-${Date.now()}-${index}`,
        front,
        back,
        example,
        note,
      };
    })
    .filter((card) => card.front && card.back);
}