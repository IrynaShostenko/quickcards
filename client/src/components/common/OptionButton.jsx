export default function OptionButton({ active, children, onClick }) {
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