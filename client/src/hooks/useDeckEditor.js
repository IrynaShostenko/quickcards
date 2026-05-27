import { useMemo, useState } from "react";

import { saveDeckWithCards } from "../api/decksApi";
import { editorMessages } from "../constants/uiText";
import { parseCards } from "../utils/cardParser";
import { cleanCardsForSave, createEmptyCard } from "../utils/deckUtils";
import { sampleDeck, sampleInput } from "../utils/sampleData";

const defaultSettings = {
  termDelimiter: "tab",
  cardDelimiter: "newline",
  customTermDelimiter: "—",
  customCardDelimiter: "###",
};

export function useDeckEditor({ isStudentOnlyView }) {
  const [title, setTitle] = useState(sampleDeck.title);
  const [description, setDescription] = useState(sampleDeck.description);
  const [rawCards, setRawCards] = useState(
    isStudentOnlyView ? "" : sampleInput,
  );
  const [savedDeck, setSavedDeck] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [isShareReady, setIsShareReady] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  const [previewCards, setPreviewCards] = useState(() =>
    isStudentOnlyView ? [] : parseCards(sampleInput, defaultSettings),
  );

  const parsedCards = useMemo(
    () => parseCards(rawCards, settings),
    [rawCards, settings],
  );

  const markDraftChanged = () => {
    setIsShareReady(false);
    setIsSharePanelOpen(false);
    setSavedDeck(null);
  };

  const updateTitle = (value) => {
    setTitle(value);
    markDraftChanged();
  };

  const updateDescription = (value) => {
    setDescription(value);
    markDraftChanged();
  };

  const updateRawCards = (value) => {
    setRawCards(value);
    markDraftChanged();
  };

  const clearRawCards = () => {
    setRawCards("");
    markDraftChanged();
  };

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const importToPreview = () => {
    setPreviewCards(parsedCards);
    setRawCards("");
    markDraftChanged();
    setSaveMessage(editorMessages.importSuccess(parsedCards.length));
  };

  const updatePreviewCard = (cardId, field, value) => {
    markDraftChanged();

    setPreviewCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card,
      ),
    );
  };

  const deletePreviewCard = (cardId) => {
    markDraftChanged();

    setPreviewCards((currentCards) =>
      currentCards.filter((card) => card.id !== cardId),
    );
  };

  const addPreviewCard = () => {
    markDraftChanged();
    setPreviewCards((currentCards) => [createEmptyCard(), ...currentCards]);
  };

  const saveDeck = async () => {
    const cleanCards = cleanCardsForSave(previewCards);

    if (!cleanCards.length) {
      setSaveMessage(editorMessages.addAtLeastOneCard);
      return null;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const savedDeckFromApi = await saveDeckWithCards({
        existingDeckId: savedDeck?.id,
        title,
        description,
        cards: cleanCards,
      });

      setSavedDeck(savedDeckFromApi);
      setPreviewCards(cleanCards);
      setIsShareReady(true);
      setIsSharePanelOpen(false);
      setSaveMessage(editorMessages.saveSuccess(cleanCards.length));

      return savedDeckFromApi;
    } catch (error) {
      console.error(error);
      setSaveMessage(editorMessages.saveError(error.message));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const startNewDeck = () => {
    setTitle("Untitled set");
    setDescription("");
    setRawCards("");
    setPreviewCards([]);
    setSavedDeck(null);
    setIsShareReady(false);
    setIsSharePanelOpen(false);
    setSaveMessage(editorMessages.newCardModuleStarted);
  };

  const createDeck = () => {
    setSaveMessage(editorMessages.createDeckLater);
  };

  const createAndPractice = () => {
    setSaveMessage(editorMessages.createAndPracticeLater);
  };

  const shareUrl = savedDeck
    ? `${window.location.origin}${window.location.pathname}#/practice/${savedDeck.id}`
    : "";

  const copyShareLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setSaveMessage(editorMessages.couldNotCopyStudentLink);
    }
  };

  const shareDeck = async () => {
    if (!savedDeck) return;

    setIsSharePanelOpen(true);
    await copyShareLink();

    setSaveMessage(editorMessages.studentLinkCopied);
  };

  const closeMessage = () => {
    setSaveMessage("");
  };

  return {
    title,
    description,
    rawCards,
    parsedCards,
    previewCards,
    settings,
    savedDeck,
    saveMessage,
    copied,
    isShareReady,
    isSharePanelOpen,
    isSaving,
    shareUrl,

    updateTitle,
    updateDescription,
    updateRawCards,
    clearRawCards,
    updateSetting,
    importToPreview,
    updatePreviewCard,
    deletePreviewCard,
    addPreviewCard,
    saveDeck,
    startNewDeck,
    createDeck,
    createAndPractice,
    copyShareLink,
    shareDeck,
    closeMessage,
    setSaveMessage,
  };
}
