import OptionButton from "../common/OptionButton";
import { insertTextAtCursor } from "../../utils/cardParser";
import { cardImportText } from "../../constants/uiText";

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
          <h2 className="text-xl font-bold">{cardImportText.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {cardImportText.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
            {parsedCardsCount} {cardImportText.detectedSuffix}
          </span>

          <button
            type="button"
            onClick={onClear}
            className="rounded-3xl bg-indigo-50 px-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100"
          >
            {cardImportText.clearButton}
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
        placeholder={cardImportText.textareaPlaceholder}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 font-bold text-slate-700">
            {cardImportText.columnsLabel}
          </p>

          <div className="flex flex-wrap gap-2">
            <OptionButton
              active={settings.termDelimiter === "tab"}
              onClick={() => onSettingChange("termDelimiter", "tab")}
            >
              {cardImportText.options.tab}
            </OptionButton>

            <OptionButton
              active={settings.termDelimiter === "comma"}
              onClick={() => onSettingChange("termDelimiter", "comma")}
            >
              {cardImportText.options.comma}
            </OptionButton>

            <OptionButton
              active={settings.termDelimiter === "custom"}
              onClick={() => onSettingChange("termDelimiter", "custom")}
            >
              {cardImportText.options.custom}
            </OptionButton>
          </div>

          {settings.termDelimiter === "custom" && (
            <input
              value={settings.customTermDelimiter}
              onChange={(event) =>
                onSettingChange("customTermDelimiter", event.target.value)
              }
              className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              placeholder={cardImportText.customTermPlaceholder}
            />
          )}
        </div>

        <div>
          <p className="mb-3 font-bold text-slate-700">
            {cardImportText.cardsLabel}
          </p>

          <div className="flex flex-wrap gap-2">
            <OptionButton
              active={settings.cardDelimiter === "newline"}
              onClick={() => onSettingChange("cardDelimiter", "newline")}
            >
              {cardImportText.options.newline}
            </OptionButton>

            <OptionButton
              active={settings.cardDelimiter === "semicolon"}
              onClick={() => onSettingChange("cardDelimiter", "semicolon")}
            >
              {cardImportText.options.semicolon}
            </OptionButton>

            <OptionButton
              active={settings.cardDelimiter === "custom"}
              onClick={() => onSettingChange("cardDelimiter", "custom")}
            >
              {cardImportText.options.custom}
            </OptionButton>
          </div>

          {settings.cardDelimiter === "custom" && (
            <input
              value={settings.customCardDelimiter}
              onChange={(event) =>
                onSettingChange("customCardDelimiter", event.target.value)
              }
              className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-300"
              placeholder={cardImportText.customCardPlaceholder}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onImport}
          className="rounded-3xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-700"
        >
          {cardImportText.importButton}
        </button>
      </div>
    </section>
  );
}
