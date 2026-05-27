import { deckEditorHeaderText } from "../../constants/uiText";

export default function DeckEditorHeader({
  title,
  description,
  isSaving,
  onTitleChange,
  onDescriptionChange,
  onStartNewDeck,
  onSave,
  onCreate,
  onCreateAndPractice,
}) {
  return (
    <>
      <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {deckEditorHeaderText.title}
          </h1>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {deckEditorHeaderText.visibilityLabel}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStartNewDeck}
            className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100"
          >
            {deckEditorHeaderText.buttons.new}
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? deckEditorHeaderText.buttons.saving
              : deckEditorHeaderText.buttons.save}
          </button>

          <button
            type="button"
            onClick={onCreate}
            className="rounded-3xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-100"
          >
            {deckEditorHeaderText.buttons.create}
          </button>

          <button
            type="button"
            onClick={onCreateAndPractice}
            className="rounded-3xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-500"
          >
            {deckEditorHeaderText.buttons.createAndPractice}
          </button>
        </div>
      </header>

      <section className="mb-8 space-y-3">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="w-full rounded-2xl border border-transparent bg-white px-6 py-5 text-xl font-bold shadow-sm outline-none transition focus:border-indigo-300"
          placeholder={deckEditorHeaderText.fields.titlePlaceholder}
        />

        <input
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="w-full rounded-2xl border border-transparent bg-white px-6 py-5 text-lg text-slate-600 shadow-sm outline-none transition focus:border-indigo-300"
          placeholder={deckEditorHeaderText.fields.descriptionPlaceholder}
        />
      </section>
    </>
  );
}