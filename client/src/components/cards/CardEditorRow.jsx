export default function CardEditorRow({ card, onUpdate, onDelete }) {
  return (
    <article className="grid grid-cols-[1fr_1fr_1.3fr_0.9fr_52px] gap-4 px-6 py-5">
      <input
        value={card.front}
        onChange={(event) => onUpdate(card.id, "front", event.target.value)}
        className="rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="Expression"
      />

      <input
        value={card.back}
        onChange={(event) => onUpdate(card.id, "back", event.target.value)}
        className="rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="Meaning"
      />

      <input
        value={card.example}
        onChange={(event) => onUpdate(card.id, "example", event.target.value)}
        className="rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="Example"
      />

      <input
        value={card.note}
        onChange={(event) => onUpdate(card.id, "note", event.target.value)}
        className="rounded-2xl bg-amber-50 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200"
        placeholder="Note"
      />

      <button
        type="button"
        onClick={() => onDelete(card.id)}
        className="rounded-2xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
        aria-label="Delete card"
      >
        ×
      </button>
    </article>
  );
}
