export default function StatusMessage({ children, type = "info", onClose }) {
  const styles = {
    info: "border-indigo-100 bg-indigo-50 text-indigo-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    error: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 text-sm font-semibold ${
        styles[type] || styles.info
      }`}
    >
      <div>{children}</div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 text-lg leading-none opacity-60 hover:opacity-100"
          aria-label="Close message"
        >
          ×
        </button>
      )}
    </div>
  );
}
