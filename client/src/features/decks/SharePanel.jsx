export default function SharePanel({
  shareUrl,
  copied,
  onCopy,
  onOpen,
  onClose,
}) {
  return (
    <section className="mb-8 rounded-[2rem] border border-indigo-100 bg-indigo-50 p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Share with students
          </h2>
          <p className="mt-2 text-slate-600">
            Copy this link and send it to your students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-2xl bg-white px-6 py-4 font-bold text-indigo-600 shadow-sm hover:bg-slate-50"
          >
            Open student view
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-xl font-bold leading-none text-indigo-400 hover:bg-white hover:text-indigo-700"
            aria-label="Close share panel"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={shareUrl}
          readOnly
          className="min-w-0 flex-1 rounded-2xl border border-indigo-100 bg-white px-5 py-4 text-slate-700 outline-none"
        />

        <button
          type="button"
          onClick={onCopy}
          className="rounded-2xl bg-indigo-600 px-7 py-4 font-bold text-white shadow-sm hover:bg-indigo-500"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </section>
  );
}
