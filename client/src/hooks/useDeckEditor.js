import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const [settings, setSettings] = useState(defaultSettings);
  const [previewCards, setPreviewCards] = useState(() =>
    isStudentOnlyView ? [] : parseCards(sampleInput, defaultSettings),
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const parsedCards = useMemo(
    () => parseCards(rawCards, settings),
    [rawCards, settings],
  );

  const markDraftChanged = () => {
    setHasUnsavedChanges(true);
    setAutosaveMessage("");
    setIsShareReady(false);
    setIsSharePanelOpen(false);
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

  const saveCurrentDeck = useCallback(
    async ({ showMessage = true } = {}) => {
      const cleanCards = cleanCardsForSave(previewCards);

      if (!cleanCards.length) {
        const error = new Error(editorMessages.addAtLeastOneCard);
        error.statusCode = 400;
        throw error;
      }

      const savedDeckFromApi = await saveDeckWithCards({
        existingDeckId: savedDeck?.id,
        title,
        description,
        cards: cleanCards,
      });

      setSavedDeck(savedDeckFromApi);
      setPreviewCards(cleanCards);
      setHasUnsavedChanges(false);
      setIsShareReady(true);
      setIsSharePanelOpen(false);

      if (showMessage) {
        setSaveMessage(editorMessages.saveSuccess(cleanCards.length));
      }

      return savedDeckFromApi;
    },
    [description, previewCards, savedDeck?.id, title],
  );

  const saveDeck = async () => {
    setIsSaving(true);
    setAutosaveMessage("");
    setSaveMessage("");

    try {
      const savedDeckFromApi = await saveCurrentDeck({ showMessage: true });
      return savedDeckFromApi;
    } catch (error) {
      console.error(error);
      setSaveMessage(editorMessages.saveError(error.message));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!savedDeck?.id) return;
    if (!hasUnsavedChanges) return;
    if (isSaving) return;

    const autosaveTimer = window.setTimeout(async () => {
      setIsAutosaving(true);
      setAutosaveMessage("Autosaving...");

      try {
        await saveCurrentDeck({ showMessage: false });
        setAutosaveMessage("Autosaved");
      } catch (error) {
        console.error(error);
        setAutosaveMessage("Autosave failed");
      } finally {
        setIsAutosaving(false);
      }
    }, 1500);

    return () => window.clearTimeout(autosaveTimer);
  }, [hasUnsavedChanges, isSaving, saveCurrentDeck, savedDeck?.id]);

  const startNewDeck = () => {
    setTitle("Untitled set");
    setDescription("");
    setRawCards("");
    setPreviewCards([]);
    setSavedDeck(null);
    setHasUnsavedChanges(true);
    setAutosaveMessage("");
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

  const shareUrl = savedDeck?.public_slug
    ? `${window.location.origin}${window.location.pathname}#/practice/${savedDeck.public_slug}`
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

  const closeSharePanel = () => {
    setIsSharePanelOpen(false);
  };

  const loadDeckIntoEditor = useCallback((deck) => {
    setTitle(deck.title || "");
    setDescription(deck.description || "");
    setRawCards("");
    setPreviewCards(deck.cards || []);
    setSavedDeck(deck);
    setHasUnsavedChanges(false);
    setAutosaveMessage("");
    setIsShareReady(Boolean(deck.public_slug));
    setIsSharePanelOpen(false);
    setSaveMessage("");
  }, []);

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
    isAutosaving,
    autosaveMessage,
    shareUrl,
    hasUnsavedChanges,

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
    closeSharePanel,
    loadDeckIntoEditor,
    setSaveMessage,
  };
}
