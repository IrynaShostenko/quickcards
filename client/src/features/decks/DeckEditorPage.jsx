import CardImportBox from "../../components/cards/CardImportBox";
import CardsPreviewTable from "../../components/cards/CardsPreviewTable";
import StatusMessage from "../../components/common/StatusMessage";
import DeckEditorHeader from "./DeckEditorHeader";
import SharePanel from "./SharePanel";

export default function DeckEditorPage({
  title,
  description,
  rawCards,
  parsedCards,
  previewCards,
  settings,
  saveMessage,
  isSaving,
  isShareReady,
  isAutosaving,
  autosaveMessage,
  isSharePanelOpen,
  savedDeck,
  shareUrl,
  copied,
  onTitleChange,
  onDescriptionChange,
  onStartNewDeck,
  onSave,
  onCreate,
  onCreateAndPractice,
  onOpenDashboard,
  onCloseMessage,
  onRawCardsChange,
  onClearRawCards,
  onSettingChange,
  onImportToPreview,
  onCopyShareLink,
  onOpenStudentView,
  onAddCard,
  onShare,
  onPracticePreview,
  onUpdateCard,
  onDeleteCard,
  onCloseSharePanel,
  hasUnsavedChanges,
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <DeckEditorHeader
          title={title}
          description={description}
          isSaving={isSaving}
          isAutosaving={isAutosaving}
          autosaveMessage={autosaveMessage}
          hasUnsavedChanges={hasUnsavedChanges}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onStartNewDeck={onStartNewDeck}
          onSave={onSave}
          onCreate={onCreate}
          onCreateAndPractice={onCreateAndPractice}
          onOpenDashboard={onOpenDashboard}
        />

        {saveMessage && (
          <StatusMessage onClose={onCloseMessage}>{saveMessage}</StatusMessage>
        )}

        <CardImportBox
          rawCards={rawCards}
          parsedCardsCount={parsedCards.length}
          settings={settings}
          onRawCardsChange={onRawCardsChange}
          onClear={onClearRawCards}
          onSettingChange={onSettingChange}
          onImport={onImportToPreview}
        />

        {isShareReady && isSharePanelOpen && savedDeck && (
          <SharePanel
            shareUrl={shareUrl}
            copied={copied}
            onCopy={onCopyShareLink}
            onOpen={onOpenStudentView}
            onClose={onCloseSharePanel}
          />
        )}

        <CardsPreviewTable
          previewCards={previewCards}
          isSaving={isSaving}
          isShareReady={isShareReady}
          onAddCard={onAddCard}
          onSave={onSave}
          onShare={onShare}
          onPractice={onPracticePreview}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
        />
      </div>
    </main>
  );
}
