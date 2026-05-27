import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";


import { sampleDeck, sampleInput } from "./utils/sampleData";
import { insertTextAtCursor, parseCards } from "./utils/cardParser";
import { getPracticeDeckIdFromUrl } from "./utils/routeUtils";

import OptionButton from "./components/common/OptionButton";
import StudentDeck from "./features/practice/StudentDeck";
import CardsPreviewTable from "./components/cards/CardsPreviewTable";


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

  const getStudentLink = () => {
    if (!savedDeck) return "";
    return `${window.location.origin}${window.location.pathname}#/practice/${savedDeck.id}`;
  };

  const shareDeck = () => {
    if (!savedDeck) return;
    setIsSharePanelOpen(true);
    const studentLink = getStudentLink();
    navigator.clipboard?.writeText(studentLink);
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
        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Create a card module
            </h1>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Public
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startNewDeck}
              className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100"
            >
              New
            </button>
            <button
              onClick={saveDeck}
              disabled={isSaving}
              className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={createDeck}
              className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100"
            >
              Create
            </button>
            <button
              onClick={createAndPractice}
              className="rounded-3xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-500"
            >
              Create and practice
            </button>
          </div>
        </header>

        {saveMessage && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700">
            {saveMessage}
          </div>
        )}

        <section className="mb-8 space-y-3">
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              markDraftChanged();
            }}
            className="w-full rounded-2xl border border-transparent bg-white px-6 py-5 text-xl font-bold shadow-sm outline-none transition focus:border-indigo-300"
            placeholder="Title"
          />
          <input
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              markDraftChanged();
            }}
            className="w-full rounded-2xl border border-transparent bg-white px-6 py-5 text-lg text-slate-600 shadow-sm outline-none transition focus:border-indigo-300"
            placeholder="Add a description..."
          />
        </section>

        <section className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Import your data</h2>
              <p className="mt-1 text-sm text-slate-500">
                Copy and paste from Excel, Google Sheets, Word, or Google Docs.
                Columns: Expression, Meaning, Example, Note.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                {parsedCards.length} detected
              </span>
              <button
                type="button"
                onClick={() => setRawCards("")}
                className="rounded-3xl bg-indigo-50 px-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={rawCards}
            onChange={(event) => setRawCards(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Tab") {
                event.preventDefault();
                const result = insertTextAtCursor(event, "\t");
                setRawCards(result.value);
                requestAnimationFrame(() => {
                  event.currentTarget.selectionStart = result.cursorPosition;
                  event.currentTarget.selectionEnd = result.cursorPosition;
                });
              }
            }}
            className="min-h-[260px] w-full rounded-3xl border-2 border-indigo-500/70 bg-white px-5 py-4 font-mono text-sm leading-6 outline-none transition focus:border-indigo-600"
            placeholder="Expression[TAB]Meaning[TAB]Example[TAB]Note"
          />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 font-bold text-slate-700">Between columns</p>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  active={settings.termDelimiter === "tab"}
                  onClick={() => updateSetting("termDelimiter", "tab")}
                >
                  Tab
                </OptionButton>
                <OptionButton
                  active={settings.termDelimiter === "comma"}
                  onClick={() => updateSetting("termDelimiter", "comma")}
                >
                  Comma
                </OptionButton>
                <OptionButton
                  active={settings.termDelimiter === "custom"}
                  onClick={() => updateSetting("termDelimiter", "custom")}
                >
                  Custom
                </OptionButton>
              </div>
              {settings.termDelimiter === "custom" && (
                <input
                  value={settings.customTermDelimiter}
                  onChange={(event) =>
                    updateSetting("customTermDelimiter", event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
                  placeholder="Example: —"
                />
              )}
            </div>

            <div>
              <p className="mb-3 font-bold text-slate-700">Between cards</p>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  active={settings.cardDelimiter === "newline"}
                  onClick={() => updateSetting("cardDelimiter", "newline")}
                >
                  New line
                </OptionButton>
                <OptionButton
                  active={settings.cardDelimiter === "semicolon"}
                  onClick={() => updateSetting("cardDelimiter", "semicolon")}
                >
                  Semicolon
                </OptionButton>
                <OptionButton
                  active={settings.cardDelimiter === "custom"}
                  onClick={() => updateSetting("cardDelimiter", "custom")}
                >
                  Custom
                </OptionButton>
              </div>
              {settings.cardDelimiter === "custom" && (
                <input
                  value={settings.customCardDelimiter}
                  onChange={(event) =>
                    updateSetting("customCardDelimiter", event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
                  placeholder="Example: ###"
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={importToPreview}
              className="rounded-3xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-700"
            >
              Import to preview
            </button>
          </div>
        </section>

        {isShareReady && isSharePanelOpen && savedDeck && (
          <section className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Share with students</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Anyone with this link can practice this set. Editing is not
                  available from the student link.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={shareDeck}
                  className="rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500"
                >
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => setIsSharePanelOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Close share panel"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input
                readOnly
                value={getStudentLink()}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-600 outline-none"
              />
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Practice only
              </span>
            </div>
          </section>
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