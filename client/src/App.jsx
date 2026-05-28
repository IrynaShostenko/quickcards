import { useEffect, useMemo, useState } from "react";

import { getPublicDeck } from "./api/publicApi";
import { editorMessages } from "./constants/uiText";

import DeckEditorPage from "./features/decks/DeckEditorPage";
import PracticeLoadingPage from "./features/practice/PracticeLoadingPage";
import PracticeNotFoundPage from "./features/practice/PracticeNotFoundPage";
import StudentDeck from "./features/practice/StudentDeck";

import { useDeckEditor } from "./hooks/useDeckEditor";
import { getPracticeDeckIdFromUrl } from "./utils/routeUtils";

export default function App() {
  const practiceDeckId = useMemo(() => getPracticeDeckIdFromUrl(), []);
  const isStudentOnlyView = Boolean(practiceDeckId);

  const [mode, setMode] = useState(isStudentOnlyView ? "student" : "editor");
  const [studentDeck, setStudentDeck] = useState(null);
  const [isLoadingStudentDeck, setIsLoadingStudentDeck] =
    useState(isStudentOnlyView);

  const editor = useDeckEditor({ isStudentOnlyView });
  const { setSaveMessage } = editor;

  useEffect(() => {
    if (!practiceDeckId) return;

    const loadStudentDeck = async () => {
      setIsLoadingStudentDeck(true);

      try {
        const publicDeck = await getPublicDeck(practiceDeckId);
        setStudentDeck(publicDeck);
      } catch (error) {
        console.error(error);
        setSaveMessage(editorMessages.loadPracticeError(error.message));
      } finally {
        setIsLoadingStudentDeck(false);
      }
    };

    loadStudentDeck();
  }, [practiceDeckId, setSaveMessage]);

  const practiceCards = isStudentOnlyView
    ? studentDeck?.cards || []
    : editor.previewCards;

  const practiceTitle = isStudentOnlyView ? studentDeck?.title : editor.title;

  const practiceDescription = isStudentOnlyView
    ? studentDeck?.description
    : editor.description;

  if (isStudentOnlyView && isLoadingStudentDeck) {
    return <PracticeLoadingPage />;
  }

  if (isStudentOnlyView && !studentDeck) {
    return <PracticeNotFoundPage message={editor.saveMessage} />;
  }

  if (mode === "student") {
    return (
      <StudentDeck
        title={practiceTitle}
        description={practiceDescription}
        cards={practiceCards}
        onBackToEditor={() => setMode("editor")}
        showBackButton={!isStudentOnlyView}
      />
    );
  }

  return (
    <DeckEditorPage
      title={editor.title}
      description={editor.description}
      rawCards={editor.rawCards}
      parsedCards={editor.parsedCards}
      previewCards={editor.previewCards}
      settings={editor.settings}
      saveMessage={editor.saveMessage}
      isSaving={editor.isSaving}
      isShareReady={editor.isShareReady}
      isSharePanelOpen={editor.isSharePanelOpen}
      savedDeck={editor.savedDeck}
      shareUrl={editor.shareUrl}
      copied={editor.copied}
      onTitleChange={editor.updateTitle}
      onDescriptionChange={editor.updateDescription}
      onStartNewDeck={editor.startNewDeck}
      onSave={editor.saveDeck}
      onCreate={editor.createDeck}
      onCreateAndPractice={editor.createAndPractice}
      onCloseMessage={editor.closeMessage}
      onRawCardsChange={editor.updateRawCards}
      onClearRawCards={editor.clearRawCards}
      onSettingChange={editor.updateSetting}
      onImportToPreview={editor.importToPreview}
      onCopyShareLink={editor.copyShareLink}
      onOpenStudentView={() => {
        window.location.hash = `/practice/${editor.savedDeck.id}`;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
      onAddCard={editor.addPreviewCard}
      onShare={editor.shareDeck}
      onPracticePreview={() => setMode("student")}
      onUpdateCard={editor.updatePreviewCard}
      onDeleteCard={editor.deletePreviewCard}
    />
  );
}