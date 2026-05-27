import { sharePanelText } from "../../constants/uiText";

export default function SharePanel({ shareUrl, copied, onCopy, onOpen }) {
  return (
    <section className="mb-8 rounded-[2rem] border border-indigo-100 bg-indigo-50 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {sharePanelText.title}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {sharePanelText.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-sm hover:bg-indigo-100"
        >
          {sharePanelText.openButton}
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={shareUrl}
          readOnly
          className="flex-1 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
        />

        <button
          type="button"
          onClick={onCopy}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500"
        >
          {copied ? sharePanelText.copiedMessage : sharePanelText.copyButton}
        </button>
      </div>
    </section>
  );
}
