import { useState } from "react";
import Flashcard from "../../components/cards/Flashcard";
import { insertCardLater, shuffleCards } from "../../utils/cardPractice";

export default function StudentDeck({
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