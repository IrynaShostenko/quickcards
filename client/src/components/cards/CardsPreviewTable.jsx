import { cardsPreviewText } from "../../constants/uiText";
import CardEditorRow from "./CardEditorRow";

export default function CardsPreviewTable({
  previewCards,
  isSaving,
  isShareReady,
  onAddCard,
  onSave,
  onShare,
  onPractice,
  onUpdateCard,
  onDeleteCard,
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{cardsPreviewText.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {cardsPreviewText.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onAddCard}
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            {cardsPreviewText.addCardButton}
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? cardsPreviewText.savingButton
              : cardsPreviewText.saveButton}
          </button>

          <button
            onClick={onShare}
            disabled={!isShareReady}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {cardsPreviewText.shareButton}
          </button>

          <button
            onClick={onPractice}
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            {cardsPreviewText.practicePreviewButton}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="grid grid-cols-[1fr_1fr_1.3fr_0.9fr_52px] gap-4 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-500">
          <span>{cardsPreviewText.columns.front}</span>
          <span>{cardsPreviewText.columns.back}</span>
          <span>{cardsPreviewText.columns.example}</span>
          <span>{cardsPreviewText.columns.note}</span>
          <span />
        </div>

        <div className="divide-y divide-slate-100">
          {previewCards.map((card) => (
            <CardEditorRow
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}