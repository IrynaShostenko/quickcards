import OptionButton from "../common/OptionButton";
import { insertTextAtCursor } from "../../utils/cardParser";

export default function CardImportBox({
  rawCards,
  parsedCardsCount,
  settings,
  onRawCardsChange,
  onClear,
  onSettingChange,
  onImport,
}) {
  return (
    <section className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Import your data</h2>
          <p className="mt-1 text-sm text-slate-500">
            Copy and paste from Excel, Google Sheets, Word, or Google Docs.
            Columns: Expression, Meaning, Example, Note.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
            {parsedCardsCount} detected
          </span>

          <button
            type="button"
            onClick={onClear}
            className="rounded-3xl bg-indigo-50 px-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={rawCards}
        onChange={(event) => onRawCardsChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            event.preventDefault();

            const result = insertTextAtCursor(event, "\t");
            onRawCardsChange(result.value);

            requestAnimationFrame(() => {
              event.currentTarget.selectionStart = result.cursorPosition;
              event.currentTarget.selectionEnd = result.cursorPosition;
            });
          }
        }}
        className="min-h-[260px] w-full rounded-3xl border-2 border-indigo-500/70 bg-white px-5 py-4 font-mono text-sm leading-6 outline-none transition focus:border-indigo-600"
        placeholder="Expression[TAB]Meaning[TAB]Example[TAB]Note"
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 font-bold text-slate-700">Between columns</p>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              active={settings.termDelimiter === "tab"}
              onClick={() => onSettingChange("termDelimiter", "tab")}
            >
              Tab
            </OptionButton>

            <OptionButton
              active={settings.termDelimiter === "comma"}
              onClick={() => onSettingChange("termDelimiter", "comma")}
            >
              Comma
            </OptionButton>

            <OptionButton
              active={settings.termDelimiter === "custom"}
              onClick={() => onSettingChange("termDelimiter", "custom")}
            >
              Custom
            </OptionButton>
          </div>

          {settings.termDelimiter === "custom" && (
            <input
              value={settings.customTermDelimiter}
              onChange={(event) =>
                onSettingChange("customTermDelimiter", event.target.value)
              }
              className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              placeholder="Example: —"
            />
          )}
        </div>

        <div>
          <p className="mb-3 font-bold text-slate-700">Between cards</p>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              active={settings.cardDelimiter === "newline"}
              onClick={() => onSettingChange("cardDelimiter", "newline")}
            >
              New line
            </OptionButton>

            <OptionButton
              active={settings.cardDelimiter === "semicolon"}
              onClick={() => onSettingChange("cardDelimiter", "semicolon")}
            >
              Semicolon
            </OptionButton>

            <OptionButton
              active={settings.cardDelimiter === "custom"}
              onClick={() => onSettingChange("cardDelimiter", "custom")}
            >
              Custom
            </OptionButton>
          </div>

          {settings.cardDelimiter === "custom" && (
            <input
              value={settings.customCardDelimiter}
              onChange={(event) =>
                onSettingChange("customCardDelimiter", event.target.value)
              }
              className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              placeholder="Example: ###"
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onImport}
          className="rounded-3xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-700"
        >
          Import to preview
        </button>
      </div>
    </section>
  );
}
