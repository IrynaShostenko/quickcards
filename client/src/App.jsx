import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const sampleInput = `eine Entscheidung treffen	to make a decision	Wir müssen heute eine Entscheidung treffen.	not: eine Entscheidung machen
Rücksicht nehmen auf	to take into consideration	Man muss auf andere Rücksicht nehmen.	auf + Akk
zur Verfügung stehen	to be available	Der Raum steht uns morgen zur Verfügung.	
sich bewerben um	to apply for	Sie bewirbt sich um eine Stelle als Lehrerin.	sich bewerben um + Akk
die Verantwortung übernehmen	to take responsibility	Er übernimmt die Verantwortung für das Projekt.	noun + verb collocation
einen Termin vereinbaren	to make an appointment	Ich möchte einen Termin mit der Ärztin vereinbaren.	formal phrase
die Voraussetzung erfüllen	to meet the requirement	Du erfüllst alle Voraussetzungen für den Kurs.	noun phrase`;

const TERM_DELIMITERS = {
  tab: "\t",
  comma: ",",
  custom: "custom",
};

const CARD_DELIMITERS = {
  newline: "\n",
  semicolon: ";",
  custom: "custom",
};

function getDelimiter(type, customValue, dictionary) {
  if (type === "custom") return customValue || "\t";
  return dictionary[type] || "\t";
}

function insertTextAtCursor(event, textToInsert) {
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

function parseCards(raw, settings) {
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

function getPracticeDeckIdFromUrl() {
  const hashPath = window.location.hash.replace("#", "");
  const pathParts = hashPath.split("/").filter(Boolean);

  if (pathParts[0] !== "practice" || !pathParts[1]) {
    return null;
  }

  return pathParts[1];
}

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[920px] [perspective:1400px]">
      <button
        type="button"
        onClick={() => setIsFlipped((value) => !value)}
        className="relative block min-h-[520px] w-full rounded-[2rem] outline-none [transform-style:preserve-3d] transition-transform duration-500 ease-out"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        aria-label={isFlipped ? "Hide answer" : "Show answer"}
      >
        <div className="absolute inset-0 flex rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm [backface-visibility:hidden] md:p-12">
          <div className="m-auto flex max-w-3xl flex-col items-center text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Front
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
              {card.front}
            </h2>
            <p className="mt-10 rounded-full bg-slate-100 px-5 py-2 text-sm text-slate-500">
              Click to show answer
            </p>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 text-left shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] md:p-12">
          <div className="flex h-full flex-col gap-6">
            <div className="space-y-6">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Back
                </p>
                <h2 className="text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
                  {card.back}
                </h2>
              </div>

              {card.example && (
                <div className="rounded-3xl bg-slate-50 p-5 md:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Example
                  </p>
                  <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
                    {card.example}
                  </p>
                </div>
              )}

              {card.note && (
                <div className="rounded-3xl bg-amber-50 p-5 md:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-600">
                    Note
                  </p>
                  <p className="text-lg leading-relaxed text-slate-700">
                    {card.note}
                  </p>
                </div>
              )}
            </div>

            <p className="mx-auto mt-auto rounded-full bg-slate-100 px-5 py-2 text-center text-sm text-slate-500">
              Click anywhere on the card to hide answer
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

function shuffleCards(cards) {
  return [...cards].sort(() => Math.random() - 0.5);
}

function insertCardLater(queue, card, currentIndex) {
  if (!queue.length) return [card];

  const minOffset = 2;
  const maxOffset = Math.min(4, queue.length + 1);
  const offset =
    Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  const insertIndex = Math.min(currentIndex + offset, queue.length);

  return [...queue.slice(0, insertIndex), card, ...queue.slice(insertIndex)];
}

function StudentDeck({
  title,
  description,
  cards,
  onBackToEditor,
  showBackButton = true,
}) {
  const [queue, setQueue] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardStatus, setCardStatus] = useState({});
  const [lastRepeatCard, setLastRepeatCard] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const totalCards = cards.length;
  const reviewedCount = Object.keys(cardStatus).length;
  const knownCount = Object.values(cardStatus).filter(
    (status) => status === "know",
  ).length;
  const repeatCount = Object.values(cardStatus).filter(
    (status) => status === "repeat",
  ).length;
  const hardCount = Object.values(cardStatus).filter(
    (status) => status === "hard",
  ).length;
  const leftCount = queue.length;
  const currentCard = lastRepeatCard || queue[currentIndex];

  const resetSession = (nextCards) => {
    setQueue(nextCards);
    setCurrentIndex(0);
    setCardStatus({});
    setLastRepeatCard(null);
    setIsFinished(false);
  };

  const finishWithStatus = (card, status) => {
    setCardStatus((current) => ({ ...current, [card.id]: status }));
    setQueue([]);
    setLastRepeatCard(null);
    setIsFinished(true);
  };

  const moveToNextAfterRemovingCurrent = (nextQueue) => {
    if (!nextQueue.length) {
      setQueue([]);
      setCurrentIndex(0);
      setIsFinished(true);
      return;
    }

    setQueue(nextQueue);
    setCurrentIndex((index) => Math.min(index, nextQueue.length - 1));
  };

  const handleKnow = () => {
    if (!currentCard) return;

    if (lastRepeatCard) {
      finishWithStatus(lastRepeatCard, "know");
      return;
    }

    setCardStatus((current) => ({ ...current, [currentCard.id]: "know" }));
    const nextQueue = queue.filter((_, index) => index !== currentIndex);
    moveToNextAfterRemovingCurrent(nextQueue);
  };

  const handleRepeat = () => {
    if (!currentCard || lastRepeatCard) return;

    setCardStatus((current) => ({ ...current, [currentCard.id]: "repeat" }));

    const remainingQueue = queue.filter((_, index) => index !== currentIndex);

    if (!remainingQueue.length) {
      setQueue([]);
      setCurrentIndex(0);
      setLastRepeatCard(currentCard);
      return;
    }

    const nextQueue = insertCardLater(
      remainingQueue,
      currentCard,
      currentIndex,
    );
    setQueue(nextQueue);
    setCurrentIndex((index) => Math.min(index, nextQueue.length - 1));
  };

  const handleHard = () => {
    if (!currentCard) return;

    if (lastRepeatCard) {
      finishWithStatus(lastRepeatCard, "hard");
      return;
    }

    setCardStatus((current) => ({ ...current, [currentCard.id]: "hard" }));

    const remainingQueue = queue.filter((_, index) => index !== currentIndex);

    if (!remainingQueue.length) {
      setQueue([]);
      setCurrentIndex(0);
      setIsFinished(true);
      return;
    }

    const nextQueue = insertCardLater(
      remainingQueue,
      currentCard,
      currentIndex,
    );
    setQueue(nextQueue);
    setCurrentIndex((index) => Math.min(index, nextQueue.length - 1));
  };

  const repeatHardCards = () => {
    const hardCards = cards.filter((card) => cardStatus[card.id] === "hard");
    resetSession(hardCards);
  };

  if (!cards.length) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-slate-600">No cards yet.</p>
        {showBackButton && (
          <button
            onClick={onBackToEditor}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Back to editor
          </button>
        )}
      </div>
    );
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">QuickCards practice</p>
              <h1 className="text-3xl font-bold text-slate-950">
                {title || "Untitled set"}
              </h1>
              {description && (
                <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
              )}
            </div>
            {showBackButton && (
              <button
                onClick={onBackToEditor}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Back to editor
              </button>
            )}
          </div>

          <section className="mx-auto max-w-[620px] rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
            <h2 className="text-3xl font-bold text-slate-950">
              Session complete
            </h2>

            <div className="mx-auto mt-8 grid max-w-sm gap-3 text-lg text-slate-600">
              <p>Total cards: {totalCards}</p>
              <p>Reviewed: {reviewedCount}</p>
              <p>Known: {knownCount}</p>
              <p>Repeat: {repeatCount}</p>
              <p>Hard: {hardCount}</p>
            </div>

            <div className="mt-10 grid gap-3">
              <button
                onClick={() => resetSession(cards)}
                className="rounded-3xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white hover:bg-indigo-500"
              >
                Repeat all
              </button>
              <button
                onClick={repeatHardCards}
                disabled={!hardCount}
                className="rounded-3xl bg-rose-100 px-6 py-4 text-lg font-bold text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                Repeat hard
              </button>
              <button
                onClick={() => resetSession(shuffleCards(cards))}
                className="rounded-3xl bg-slate-100 px-6 py-4 text-lg font-bold text-slate-700 hover:bg-slate-200"
              >
                Practice random order
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">QuickCards practice</p>
            <h1 className="text-3xl font-bold text-slate-950">
              {title || "Untitled set"}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
            )}
          </div>
          {showBackButton && (
            <button
              onClick={onBackToEditor}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Back to editor
            </button>
          )}
        </div>

        <div className="mx-auto mb-5 flex max-w-[920px] flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            {totalCards} cards · {reviewedCount} reviewed · {leftCount} left ·{" "}
            {hardCount} hard
          </span>
          {lastRepeatCard && (
            <span className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-700">
              Last repeat: choose Know or Hard
            </span>
          )}
        </div>

        <Flashcard
          key={`${currentCard.id}-${currentIndex}-${Boolean(lastRepeatCard)}`}
          card={currentCard}
        />

        <div className="mx-auto mt-6 grid max-w-[920px] gap-3 md:grid-cols-3">
          <button
            onClick={handleKnow}
            className="rounded-3xl bg-emerald-50 px-6 py-5 text-lg font-bold text-emerald-700 hover:bg-emerald-100"
          >
            Know
          </button>
          {!lastRepeatCard && (
            <button
              onClick={handleRepeat}
              className="rounded-3xl bg-amber-50 px-6 py-5 text-lg font-bold text-amber-700 hover:bg-amber-100"
            >
              Repeat
            </button>
          )}
          <button
            onClick={handleHard}
            className="rounded-3xl bg-rose-50 px-6 py-5 text-lg font-bold text-rose-700 hover:bg-rose-100"
          >
            Hard
          </button>
        </div>

        <div className="mx-auto mt-5 flex max-w-[920px] justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
            disabled={Boolean(lastRepeatCard) || currentIndex === 0}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentIndex((index) => Math.min(index + 1, queue.length - 1))
            }
            disabled={
              Boolean(lastRepeatCard) || currentIndex === queue.length - 1
            }
            className="rounded-2xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const practiceDeckId = useMemo(() => getPracticeDeckIdFromUrl(), []);
  const isStudentOnlyView = Boolean(practiceDeckId);

  const [title, setTitle] = useState("German B2 — Fixed expressions");
  const [description, setDescription] = useState("Practice after Lesson 5");
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

        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Preview and edit</h2>
              <p className="mt-1 text-sm text-slate-500">
                These are the final cards that will be saved when you click
                Save.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={addPreviewCard}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Add card
              </button>
              <button
                onClick={saveDeck}
                disabled={isSaving}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={shareDeck}
                disabled={!isShareReady}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Share
              </button>
              <button
                onClick={() => setMode("student")}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Practice preview
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[1fr_1fr_1.3fr_0.9fr_52px] gap-4 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-500">
              <span>Expression</span>
              <span>Meaning</span>
              <span>Example</span>
              <span>Note</span>
              <span />
            </div>

            <div className="divide-y divide-slate-100">
              {previewCards.map((card) => (
                <article
                  key={card.id}
                  className="grid grid-cols-[1fr_1fr_1.3fr_0.9fr_52px] gap-4 px-6 py-5"
                >
                  <input
                    value={card.front}
                    onChange={(event) =>
                      updatePreviewCard(card.id, "front", event.target.value)
                    }
                    className="rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Expression"
                  />
                  <input
                    value={card.back}
                    onChange={(event) =>
                      updatePreviewCard(card.id, "back", event.target.value)
                    }
                    className="rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Meaning"
                  />
                  <input
                    value={card.example}
                    onChange={(event) =>
                      updatePreviewCard(card.id, "example", event.target.value)
                    }
                    className="rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Example"
                  />
                  <input
                    value={card.note}
                    onChange={(event) =>
                      updatePreviewCard(card.id, "note", event.target.value)
                    }
                    className="rounded-2xl bg-amber-50 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Note"
                  />
                  <button
                    type="button"
                    onClick={() => deletePreviewCard(card.id)}
                    className="rounded-2xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete card"
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}