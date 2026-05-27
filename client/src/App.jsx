import { useEffect, useMemo, useState } from "react";
import { getPublicDeck } from "./api/publicApi";
import { saveDeckWithCards } from "./api/decksApi";

import { sampleDeck, sampleInput } from "./utils/sampleData";
import { parseCards } from "./utils/cardParser";
import { getPracticeDeckIdFromUrl } from "./utils/routeUtils";

import StudentDeck from "./features/practice/StudentDeck";
import DeckEditorPage from "./features/decks/DeckEditorPage";
import PracticeLoadingPage from "./features/practice/PracticeLoadingPage";
import PracticeNotFoundPage from "./features/practice/PracticeNotFoundPage";

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
        setSaveMessage(`Could not load this practice set: ${error.message}`);
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
    setSaveMessage(
      `${parsedCards.length} cards imported to preview. The import field was cleared.`,
    );
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
    setPreviewCards((currentCards) => [
      {
        id: `card-${Date.now()}`,
        front: "",
        back: "",
        example: "",
        note: "",
      },
      ...currentCards,
    ]);
  };

  const saveDeck = async () => {
    const cleanCards = previewCards
      .map((card) => ({
        ...card,
        front: card.front.trim(),
        back: card.back.trim(),
        example: card.example.trim(),
        note: card.note.trim(),
      }))
      .filter((card) => card.front && card.back);

    if (!cleanCards.length) {
      setSaveMessage("Add at least one card with expression and meaning.");
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
      setSaveMessage(
        `Set saved with ${cleanCards.length} cards. Share is now available.`,
      );

      return savedDeckFromApi;
    } catch (error) {
      console.error(error);
      setSaveMessage(`Could not save the set: ${error.message}`);
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
    setSaveMessage("New card module started.");
  };

  const createDeck = () => {
    setSaveMessage(
      "Create will save the set and return to the teacher dashboard. This step will be connected later.",
    );
  };

  const createAndPractice = () => {
    setSaveMessage(
      "Create and practice will save the set, return to the dashboard, and open the student link in a new window. This step will be connected later.",
    );
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
      setSaveMessage("Could not copy the student link.");
    }
  };

  const shareDeck = async () => {
    if (!savedDeck) return;

    setIsSharePanelOpen(true);
    await copyShareLink();

    setSaveMessage(
      "Student link copied. Anyone with this link can practice this set.",
    );
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
