import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

import { sampleDeck, sampleInput } from "./utils/sampleData";
import { parseCards } from "./utils/cardParser";
import { getPracticeDeckIdFromUrl } from "./utils/routeUtils";

import StudentDeck from "./features/practice/StudentDeck";
import CardsPreviewTable from "./components/cards/CardsPreviewTable";
import CardImportBox from "./components/cards/CardImportBox";
import DeckEditorHeader from "./features/decks/DeckEditorHeader";
import SharePanel from "./features/decks/SharePanel";

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
        const { data: deckData, error: deckError } = await supabase
          .from("decks")
          .select("id, title, description, created_at")
          .eq("id", practiceDeckId)
          .eq("is_public", true)
          .single();

        if (deckError) throw deckError;

        const { data: cardsData, error: cardsError } = await supabase
          .from("cards")
          .select("id, front, back, example, note, order_index")
          .eq("deck_id", practiceDeckId)
          .order("order_index", { ascending: true });

        if (cardsError) throw cardsError;

        setStudentDeck({
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
        });
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
    const cleanCards = previewCards.filter(
      (card) => card.front.trim() && card.back.trim(),
    );

    if (!cleanCards.length) {
      setSaveMessage(
        "Add at least one card with Expression and Meaning before saving.",
      );
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const { data: deckData, error: deckError } = await supabase
        .from("decks")
        .insert({
          title: title || "Untitled set",
          description,
          is_public: true,
        })
        .select("id, title, description, created_at")
        .single();

      if (deckError) throw deckError;

      const cardsToInsert = cleanCards.map((card, index) => ({
        deck_id: deckData.id,
        front: card.front,
        back: card.back,
        example: card.example || null,
        note: card.note || null,
        order_index: index,
      }));

      const { error: cardsError } = await supabase
        .from("cards")
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;

      const savedDeckFromSupabase = {
        id: deckData.id,
        title: deckData.title,
        description: deckData.description,
        cards: cleanCards,
        createdAt: deckData.created_at,
      };

      setSavedDeck(savedDeckFromSupabase);
      setPreviewCards(cleanCards);
      setIsShareReady(true);
      setIsSharePanelOpen(false);
      setSaveMessage(
        `Set saved with ${cleanCards.length} cards. Share is now available.`,
      );
    } catch (error) {
      console.error(error);
      setSaveMessage(`Could not save the set: ${error.message}`);
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
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-slate-500">Loading practice set...</p>
        </div>
      </main>
    );
  }

  if (isStudentOnlyView && !studentDeck) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Practice set not found
          </h1>
          <p className="mt-2 text-slate-500">
            This link may be incorrect, private, or the set could not be loaded.
          </p>
          {saveMessage && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {saveMessage}
            </p>
          )}
        </div>
      </main>
    );
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <DeckEditorHeader
          title={title}
          description={description}
          isSaving={isSaving}
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
        />

        {saveMessage && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700">
            {saveMessage}
          </div>
        )}

        <CardImportBox
          rawCards={rawCards}
          parsedCardsCount={parsedCards.length}
          settings={settings}
          onRawCardsChange={(value) => {
            setRawCards(value);
            markDraftChanged();
          }}
          onClear={() => {
            setRawCards("");
            markDraftChanged();
          }}
          onSettingChange={updateSetting}
          onImport={importToPreview}
        />

        {isShareReady && isSharePanelOpen && savedDeck && (
          <SharePanel
            shareUrl={shareUrl}
            copied={copied}
            onCopy={copyShareLink}
            onOpen={() => {
              window.location.hash = `/practice/${savedDeck.id}`;
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }}
          />
        )}

        <CardsPreviewTable
          previewCards={previewCards}
          isSaving={isSaving}
          isShareReady={isShareReady}
          onAddCard={addPreviewCard}
          onSave={saveDeck}
          onShare={shareDeck}
          onPractice={() => setMode("student")}
          onUpdateCard={updatePreviewCard}
          onDeleteCard={deletePreviewCard}
        />
      </div>
    </main>
  );
}
