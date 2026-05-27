import { useEffect, useMemo, useState } from "react";

import { saveDeckWithCards } from "./api/decksApi";
import { getPublicDeck } from "./api/publicApi";

import { editorMessages } from "./constants/uiText";

import DeckEditorPage from "./features/decks/DeckEditorPage";
import PracticeLoadingPage from "./features/practice/PracticeLoadingPage";
import PracticeNotFoundPage from "./features/practice/PracticeNotFoundPage";
import StudentDeck from "./features/practice/StudentDeck";

import { parseCards } from "./utils/cardParser";
import { cleanCardsForSave, createEmptyCard } from "./utils/deckUtils";
import { getPracticeDeckIdFromUrl } from "./utils/routeUtils";
import { sampleDeck, sampleInput } from "./utils/sampleData";

export default function App() {
  const practiceDeckId = useMemo(() => getPracticeDeckIdFromUrl(), []);
  const isStudentOnlyView = Boolean(practiceDeckId);

  const [title, setTitle] = useState(sampleDeck.title);
  const [description, setDescription] = useState(sampleDeck.description);
  const [rawCards, setRawCards] = useState(
    isStudentOnlyView ? "" : sampleInput,
  );
  const [mode, setMode] = useState(isStudentOnlyView ? "student" : "editor");
  const [savedDeck, setSavedDeck] = useState(null);
  const [studentDeck, setStudentDeck] = useState(null);
  const [isLoadingStudentDeck, setIsLoadingStudentDeck] =
    useState(isStudentOnlyView);
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [isShareReady, setIsShareReady] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    termDelimiter: "tab",
    cardDelimiter: "newline",
    customTermDelimiter: "—",
    customCardDelimiter: "###",
  });

  const [previewCards, setPreviewCards] = useState(() =>
    isStudentOnlyView
      ? []
      : parseCards(sampleInput, {
          termDelimiter: "tab",
          cardDelimiter: "newline",
          customTermDelimiter: "—",
          customCardDelimiter: "###",
        }),
  );

  useEffect(() => {
    if (!practiceDeckId) return;

    const loadStudentDeck = async () => {
      setIsLoadingStudentDeck(true);

      try {
        const publicDeck = await getPublicDeck(practiceDeckId);
        setStudentDeck(publicDeck);
      } catch (error) {
        console.error(error);
        setSaveMessage(editorMessages.loadPracticeError(error.message));
      } finally {
        setIsLoadingStudentDeck(false);
      }
    };

    loadStudentDeck();
  }, [practiceDeckId]);

  const parsedCards = useMemo(
    () => parseCards(rawCards, settings),
    [rawCards, settings],
  );

  const markDraftChanged = () => {
    setIsShareReady(false);
    setIsSharePanelOpen(false);
    setSavedDeck(null);
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

  const practiceCards = isStudentOnlyView
    ? studentDeck?.cards || []
    : previewCards;

  const practiceTitle = isStudentOnlyView ? studentDeck?.title : title;

  const practiceDescription = isStudentOnlyView
    ? studentDeck?.description
    : description;

  if (isStudentOnlyView && isLoadingStudentDeck) {
    return <PracticeLoadingPage />;
  }

  if (isStudentOnlyView && !studentDeck) {
    return <PracticeNotFoundPage message={saveMessage} />;
  }

  if (mode === "student") {
    return (
      <StudentDeck
        title={practiceTitle}
        description={practiceDescription}
        cards={practiceCards}
        onBackToEditor={() => setMode("editor")}
        showBackButton={!isStudentOnlyView}
      />
    );
  }

  return (
    <DeckEditorPage
      title={title}
      description={description}
      rawCards={rawCards}
      parsedCards={parsedCards}
      previewCards={previewCards}
      settings={settings}
      saveMessage={saveMessage}
      isSaving={isSaving}
      isShareReady={isShareReady}
      isSharePanelOpen={isSharePanelOpen}
      savedDeck={savedDeck}
      shareUrl={shareUrl}
      copied={copied}
      onTitleChange={(value) => {
        setTitle(value);
        markDraftChanged();
      }}
      onDescriptionChange={(value) => {
        setDescription(value);
        markDraftChanged();
      }}
      onStartNewDeck={startNewDeck}
      onSave={saveDeck}
      onCreate={createDeck}
      onCreateAndPractice={createAndPractice}
      onCloseMessage={() => setSaveMessage("")}
      onRawCardsChange={(value) => {
        setRawCards(value);
        markDraftChanged();
      }}
      onClearRawCards={() => {
        setRawCards("");
        markDraftChanged();
      }}
      onSettingChange={updateSetting}
      onImportToPreview={importToPreview}
      onCopyShareLink={copyShareLink}
      onOpenStudentView={() => {
        window.location.hash = `/practice/${savedDeck.id}`;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
      onAddCard={addPreviewCard}
      onShare={shareDeck}
      onPracticePreview={() => setMode("student")}
      onUpdateCard={updatePreviewCard}
      onDeleteCard={deletePreviewCard}
    />
  );
}