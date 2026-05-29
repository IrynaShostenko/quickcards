import { useMemo, useState } from "react";

import { dashboardText } from "../../constants/uiText";

function formatDate(value) {
  if (!value) return dashboardText.states.noDate;

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildPracticeUrl(publicSlug) {
  return `${window.location.origin}${window.location.pathname}#/practice/${publicSlug}`;
}

export default function DashboardPage({
  decks,
  currentUser,
  isLoading,
  errorMessage,
  copiedDeckId,
  onCreateNew,
  onEditDeck,
  onDeleteDeck,
  onCopyPracticeLink,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredDecks = useMemo(() => {
    if (!normalizedSearchQuery) return decks;

    return decks.filter((deck) => {
      const practiceUrl = buildPracticeUrl(deck.public_slug);

      const searchableText = [deck.title, deck.description, practiceUrl]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [decks, normalizedSearchQuery]);

  const filteredDeckCountLabel =
    filteredDecks.length === 1
      ? dashboardText.labels.deck
      : dashboardText.labels.decks;

  const teacherName =
    currentUser?.name || currentUser?.email || dashboardText.user.fallbackName;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-[2rem] bg-white px-6 py-5 shadow-sm md:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {dashboardText.badge}
                <span className="text-slate-300">·</span>
                <span className="text-slate-600">{teacherName}</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {dashboardText.title}
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                {dashboardText.description}
              </p>

            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100"
              >
                {dashboardText.buttons.dashboard}
              </button>

              <button
                type="button"
                onClick={onCreateNew}
                className="rounded-3xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-500"
              >
                {dashboardText.buttons.newDeck}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-3xl bg-slate-100 px-6 py-3 font-bold text-slate-500 hover:bg-slate-200"
              >
                {dashboardText.user.logout}
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold">
                {dashboardText.sections.cardSetsTitle}
              </h2>

              <p className="mt-1 text-slate-500">
                {dashboardText.sections.cardSetsDescription}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {filteredDecks.length} {filteredDeckCountLabel}
            </div>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="min-w-0 rounded-2xl border border-transparent bg-slate-50 px-5 py-4 font-semibold text-slate-600 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300"
              placeholder={dashboardText.search.placeholder}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-2xl bg-indigo-50 px-6 py-4 font-bold text-indigo-600 hover:bg-indigo-100"
              >
                {dashboardText.search.clear}
              </button>
            )}
          </div>

          {isLoading && (
            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-slate-500">
              {dashboardText.states.loading}
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-2xl bg-red-50 px-5 py-4 font-semibold text-red-600">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && decks.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <h3 className="text-xl font-bold">
                {dashboardText.states.emptyTitle}
              </h3>

              <p className="mt-2 text-slate-500">
                {dashboardText.states.emptyDescription}
              </p>

              <button
                type="button"
                onClick={onCreateNew}
                className="mt-5 rounded-3xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-500"
              >
                {dashboardText.buttons.createFirstDeck}
              </button>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            decks.length > 0 &&
            filteredDecks.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-xl font-bold">
                  {dashboardText.search.noResultsTitle}
                </h3>

                <p className="mt-2 text-slate-500">
                  {dashboardText.search.noResultsDescription}
                </p>
              </div>
            )}

          {!isLoading && !errorMessage && filteredDecks.length > 0 && (
            <div className="grid gap-4">
              {filteredDecks.map((deck) => (
                <article
                  key={deck.id}
                  className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {dashboardText.labels.public}
                        </span>

                        <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                          {deck.cards_count} {dashboardText.labels.cards}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold">{deck.title}</h3>

                      {deck.description && (
                        <p className="mt-2 text-slate-500">
                          {deck.description}
                        </p>
                      )}

                      <p className="mt-4 text-sm font-semibold text-slate-400">
                        {dashboardText.states.updatedPrefix}{" "}
                        {formatDate(deck.updated_at)}
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-[240px]">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => onEditDeck(deck.id)}
                          className="rounded-3xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-indigo-500"
                        >
                          {dashboardText.buttons.edit}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteDeck(deck.id)}
                          className="rounded-3xl bg-red-50 px-5 py-3 font-bold text-red-600 hover:bg-red-100"
                        >
                          {dashboardText.buttons.delete}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onCopyPracticeLink(deck)}
                        className="w-full rounded-3xl bg-indigo-50 px-5 py-3 font-bold text-indigo-600 hover:bg-indigo-100"
                      >
                        {copiedDeckId === deck.id
                          ? dashboardText.buttons.copied
                          : dashboardText.buttons.copyLink}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
