import { useState } from "react";

export default function Flashcard({ card }) {
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
