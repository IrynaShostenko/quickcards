export const cardImportText = {
  title: "Import your data",
  description:
    "Copy and paste from Excel, Google Sheets, Word, or Google Docs. Columns: Expression, Meaning, Example, Note.",
  detectedSuffix: "detected",
  clearButton: "Clear",
  textareaPlaceholder: "Expression[TAB]Meaning[TAB]Example[TAB]Note",
  columnsLabel: "Between columns",
  cardsLabel: "Between cards",
  options: {
    tab: "Tab",
    comma: "Comma",
    custom: "Custom",
    newline: "New line",
    semicolon: "Semicolon",
  },
  customTermPlaceholder: "Example: —",
  customCardPlaceholder: "Example: ###",
  importButton: "Import to preview",
};

export const cardsPreviewText = {
  title: "Preview and edit",
  description:
    "These are the final cards that will be saved when you click Save.",
  addCardButton: "Add card",
  saveButton: "Save",
  savingButton: "Saving...",
  shareButton: "Share",
  practicePreviewButton: "Practice preview",
  columns: {
    front: "Expression",
    back: "Meaning",
    example: "Example",
    note: "Note",
  },
};

export const cardEditorRowText = {
  placeholders: {
    front: "Expression",
    back: "Meaning",
    example: "Example",
    note: "Note",
  },
  deleteAriaLabel: "Delete card",
};

export const flashcardText = {
  frontLabel: "Front",
  backLabel: "Back",
  exampleLabel: "Example",
  noteLabel: "Note",
  showAnswerHint: "Click to show answer",
  hideAnswerHint: "Click anywhere on the card to hide answer",
  showAnswerAriaLabel: "Show answer",
  hideAnswerAriaLabel: "Hide answer",
};

export const studentDeckText = {
  emptyState: "No cards yet.",
  backToEditorButton: "Back to editor",
  pageLabel: "QuickCards practice",
  untitledSet: "Untitled set",
  sessionCompleteTitle: "Session complete",
  stats: {
    totalCards: "Total cards:",
    reviewed: "Reviewed:",
    known: "Known:",
    repeat: "Repeat:",
    hard: "Hard:",
  },
  actions: {
    repeatAll: "Repeat all",
    repeatHard: "Repeat hard",
    randomOrder: "Practice random order",
    know: "Know",
    repeat: "Repeat",
    hard: "Hard",
    previous: "Previous",
    next: "Next",
  },
  progress: {
    cards: "cards",
    reviewed: "reviewed",
    left: "left",
    hard: "hard",
  },
  lastRepeatNotice: "Last repeat: choose Know or Hard",
};

export const deckEditorHeaderText = {
  title: "Create a card module",
  visibilityLabel: "Public",
  buttons: {
    dashboard: "Dashboard",
    new: "New",
    save: "Save",
    saving: "Saving...",
    create: "Create",
    createAndPractice: "Create and practice",
  },
  fields: {
    titlePlaceholder: "Title",
    descriptionPlaceholder: "Add a description...",
  },
};

export const sharePanelText = {
  title: "Share with students",
  description: "Copy this link and send it to your students.",
  openButton: "Open student view",
  copyButton: "Copy link",
  copiedMessage: "Link copied",
};

export const editorMessages = {
  addAtLeastOneCard: "Add at least one card with expression and meaning.",
  newCardModuleStarted: "New card module started.",
  createDeckLater:
    "Create will save the set and return to the teacher dashboard. This step will be connected later.",
  createAndPracticeLater:
    "Create and practice will save the set, return to the dashboard, and open the student link in a new window. This step will be connected later.",
  couldNotCopyStudentLink: "Could not copy the student link.",
  studentLinkCopied:
    "Student link copied. Anyone with this link can practice this set.",
  saveSuccess: (cardsCount) =>
    `Set saved with ${cardsCount} cards. Share is now available.`,
  saveError: (message) => `Could not save the set: ${message}`,
  loadPracticeError: (message) =>
    `Could not load this practice set: ${message}`,
  importSuccess: (cardsCount) =>
    `${cardsCount} cards imported to preview. The import field was cleared.`,
};

export const dashboardText = {
  badge: "Teacher workspace",
  title: "QuickCards",
  description:
    "Manage your card sets, open student practice links, and continue editing saved modules.",

  buttons: {
    dashboard: "Dashboard",
    newDeck: "New deck",
    loginLater: "Login later",
    createFirstDeck: "Create first deck",
    edit: "Edit",
    delete: "Delete",
    copyLink: "Copy link",
    copied: "Copied!",
  },

  sections: {
    cardSetsTitle: "Your card sets",
    cardSetsDescription:
      "Open a set to edit it or share the practice mode with students.",
  },

  search: {
    placeholder: "Search by title, description, or student link...",
    clear: "Clear",
    noResultsTitle: "No matching decks",
    noResultsDescription: "Try another title, description, or student link.",
  },

  states: {
    loading: "Loading decks...",
    emptyTitle: "No decks yet",
    emptyDescription: "Create your first card set and it will appear here.",
    noDate: "No date",
    updatedPrefix: "Updated",
  },

  labels: {
    public: "Public",
    deck: "deck",
    decks: "decks",
    cards: "cards",
  },
};