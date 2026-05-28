import { useEffect, useMemo, useRef, useState } from "react";

import { getDeckById } from "./api/decksApi";
import { getPublicDeck } from "./api/publicApi";
import { editorMessages } from "./constants/uiText";

import DeckEditorPage from "./features/decks/DeckEditorPage";
import PracticeLoadingPage from "./features/practice/PracticeLoadingPage";
import PracticeNotFoundPage from "./features/practice/PracticeNotFoundPage";
import StudentDeck from "./features/practice/StudentDeck";

import { useDeckEditor } from "./hooks/useDeckEditor";
import {
  getEditDeckIdFromUrl,
  getPracticeDeckIdFromUrl,
} from "./utils/routeUtils";

export default function App() {
  const practiceDeckId = useMemo(() => getPracticeDeckIdFromUrl(), []);
  const initialEditDeckId = useMemo(() => getEditDeckIdFromUrl(), []);
  const [currentEditDeckId, setCurrentEditDeckId] = useState(initialEditDeckId);
  const isStudentOnlyView = Boolean(practiceDeckId);

  const [mode, setMode] = useState(isStudentOnlyView ? "student" : "editor");
  const [studentDeck, setStudentDeck] = useState(null);
  const [isLoadingStudentDeck, setIsLoadingStudentDeck] =
    useState(isStudentOnlyView);
  const [isLoadingEditDeck, setIsLoadingEditDeck] = useState(
    Boolean(initialEditDeckId),
  );

  const editor = useDeckEditor({ isStudentOnlyView });
  const { loadDeckIntoEditor, setSaveMessage } = editor;
  const loadedEditDeckIdRef = useRef(null);

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

  useEffect(() => {
    if (!initialEditDeckId) return;

    if (loadedEditDeckIdRef.current === initialEditDeckId) return;

    loadedEditDeckIdRef.current = initialEditDeckId;

    const loadEditDeck = async () => {
      setIsLoadingEditDeck(true);

      try {
        const deck = await getDeckById(initialEditDeckId);
        loadDeckIntoEditor(deck);
      } catch (error) {
        console.error(error);
        setSaveMessage(editorMessages.saveError(error.message));
      } finally {
        setIsLoadingEditDeck(false);
      }
    };

    loadEditDeck();
  }, [initialEditDeckId, loadDeckIntoEditor, setSaveMessage]);

  const practiceCards = isStudentOnlyView
    ? studentDeck?.cards || []
    : editor.previewCards;

  const practiceTitle = isStudentOnlyView ? studentDeck?.title : editor.title;

  const practiceDescription = isStudentOnlyView
    ? studentDeck?.description
    : editor.description;

  if (isLoadingEditDeck) {
    return <PracticeLoadingPage />;
  }

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
      hasUnsavedChanges={editor.hasUnsavedChanges}
      isShareReady={editor.isShareReady}
      isSharePanelOpen={editor.isSharePanelOpen}
      savedDeck={editor.savedDeck}
      shareUrl={editor.shareUrl}
      copied={editor.copied}
      onTitleChange={editor.updateTitle}
      onDescriptionChange={editor.updateDescription}
      onStartNewDeck={() => {
        editor.startNewDeck();
        setCurrentEditDeckId(null);
        window.history.replaceState(null, "", window.location.pathname);
      }}
      onSave={async () => {
        const savedDeck = await editor.saveDeck();

        if (savedDeck?.id && !currentEditDeckId) {
          window.history.replaceState(null, "", `#/edit/${savedDeck.id}`);
          setCurrentEditDeckId(savedDeck.id);
        }

        return savedDeck;
      }}
      onCreate={editor.createDeck}
      onCreateAndPractice={editor.createAndPractice}
      onCloseMessage={editor.closeMessage}
      onRawCardsChange={editor.updateRawCards}
      onClearRawCards={editor.clearRawCards}
      onSettingChange={editor.updateSetting}
      onImportToPreview={editor.importToPreview}
      onCopyShareLink={editor.copyShareLink}
      onOpenStudentView={() => {
        if (!editor.shareUrl) return;

        window.open(editor.shareUrl, "_blank", "noopener,noreferrer");
      }}
      onAddCard={editor.addPreviewCard}
      onShare={editor.shareDeck}
      onPracticePreview={() => setMode("student")}
      onUpdateCard={editor.updatePreviewCard}
      onDeleteCard={editor.deletePreviewCard}
      onCloseSharePanel={editor.closeSharePanel}
    />
  );
}
