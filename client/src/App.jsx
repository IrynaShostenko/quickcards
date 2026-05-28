import { useEffect, useMemo, useState } from "react";

import { deleteDeck, getDeckById, getDecksList } from "./api/decksApi";
import { getPublicDeck } from "./api/publicApi";
import { editorMessages } from "./constants/uiText";

import DashboardPage from "./features/dashboard/DashboardPage";
import DeckEditorPage from "./features/decks/DeckEditorPage";
import PracticeLoadingPage from "./features/practice/PracticeLoadingPage";
import PracticeNotFoundPage from "./features/practice/PracticeNotFoundPage";
import StudentDeck from "./features/practice/StudentDeck";

import { useDeckEditor } from "./hooks/useDeckEditor";
import {
  getEditDeckIdFromUrl,
  getPracticeDeckIdFromUrl,
  isDashboardRoute,
} from "./utils/routeUtils";

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  const practiceDeckId = useMemo(
    () => getPracticeDeckIdFromUrl(),
    [currentHash],
  );

  const editDeckId = useMemo(() => getEditDeckIdFromUrl(), [currentHash]);

  const isDashboardView = useMemo(() => isDashboardRoute(), [currentHash]);

  const isStudentOnlyView = Boolean(practiceDeckId);

  const [mode, setMode] = useState(isStudentOnlyView ? "student" : "editor");

  const [studentDeck, setStudentDeck] = useState(null);
  const [isLoadingStudentDeck, setIsLoadingStudentDeck] =
    useState(isStudentOnlyView);

  const [isLoadingEditDeck, setIsLoadingEditDeck] = useState(
    Boolean(editDeckId),
  );

  const [dashboardDecks, setDashboardDecks] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(isDashboardView);
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState("");
  const [copiedDeckId, setCopiedDeckId] = useState(null);

  const editor = useDeckEditor({ isStudentOnlyView });
  const { loadDeckIntoEditor, setSaveMessage } = editor;

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    setMode(isStudentOnlyView ? "student" : "editor");
  }, [isStudentOnlyView]);

  useEffect(() => {
    if (!practiceDeckId) {
      setStudentDeck(null);
      setIsLoadingStudentDeck(false);
      return;
    }

    const loadStudentDeck = async () => {
      setIsLoadingStudentDeck(true);
      setStudentDeck(null);

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
    if (!editDeckId) {
      setIsLoadingEditDeck(false);
      return;
    }

    const loadEditDeck = async () => {
      setIsLoadingEditDeck(true);

      try {
        const deck = await getDeckById(editDeckId);
        loadDeckIntoEditor(deck);
      } catch (error) {
        console.error(error);
        setSaveMessage(editorMessages.saveError(error.message));
      } finally {
        setIsLoadingEditDeck(false);
      }
    };

    loadEditDeck();
  }, [editDeckId, loadDeckIntoEditor, setSaveMessage]);

  useEffect(() => {
    if (!isDashboardView) return;

    const loadDashboardDecks = async () => {
      setIsLoadingDashboard(true);
      setDashboardErrorMessage("");

      try {
        const decks = await getDecksList();
        setDashboardDecks(decks);
      } catch (error) {
        console.error(error);
        setDashboardErrorMessage(error.message || "Could not load decks.");
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboardDecks();
  }, [isDashboardView]);

  const practiceCards = isStudentOnlyView
    ? studentDeck?.cards || []
    : editor.previewCards;

  const practiceTitle = isStudentOnlyView ? studentDeck?.title : editor.title;

  const practiceDescription = isStudentOnlyView
    ? studentDeck?.description
    : editor.description;

  if (isDashboardView) {
    return (
      <DashboardPage
        decks={dashboardDecks}
        isLoading={isLoadingDashboard}
        errorMessage={dashboardErrorMessage}
        copiedDeckId={copiedDeckId}
        onCreateNew={() => {
          window.location.hash = "";
          setCurrentHash("");
        }}
        onEditDeck={(deckId) => {
          window.location.hash = `/edit/${deckId}`;
        }}
        onCopyPracticeLink={async (deck) => {
          const practiceUrl = `${window.location.origin}${window.location.pathname}#/practice/${deck.public_slug}`;

          try {
            await navigator.clipboard.writeText(practiceUrl);
            setCopiedDeckId(deck.id);

            window.setTimeout(() => {
              setCopiedDeckId(null);
            }, 1500);
          } catch (error) {
            console.error(error);
            setDashboardErrorMessage("Could not copy student link.");
          }
        }}
        onDeleteDeck={async (deckId) => {
          const shouldDelete = window.confirm(
            "Delete this deck? This action cannot be undone.",
          );

          if (!shouldDelete) return;

          try {
            await deleteDeck(deckId);

            setDashboardDecks((currentDecks) =>
              currentDecks.filter((deck) => deck.id !== deckId),
            );
          } catch (error) {
            console.error(error);
            setDashboardErrorMessage(error.message || "Could not delete deck.");
          }
        }}
      />
    );
  }

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
      isAutosaving={editor.isAutosaving}
      autosaveMessage={editor.autosaveMessage}
      hasUnsavedChanges={editor.hasUnsavedChanges}
      isShareReady={editor.isShareReady}
      isSharePanelOpen={editor.isSharePanelOpen}
      savedDeck={editor.savedDeck}
      shareUrl={editor.shareUrl}
      copied={editor.copied}
      onTitleChange={editor.updateTitle}
      onDescriptionChange={editor.updateDescription}
      onStartNewDeck={() => {
        if (editor.hasUnsavedChanges) {
          const shouldDiscardChanges = window.confirm(
            "You have unsaved changes. Start a new deck and discard them?",
          );

          if (!shouldDiscardChanges) return;
        }

        editor.startNewDeck();
        window.history.replaceState(null, "", window.location.pathname);
        setCurrentHash("");
      }}
      onOpenDashboard={() => {
        window.location.hash = "/dashboard";
      }}
      onSave={async () => {
        const savedDeck = await editor.saveDeck();

        if (savedDeck?.id && !editDeckId) {
          window.history.replaceState(null, "", `#/edit/${savedDeck.id}`);
          setCurrentHash(`#/edit/${savedDeck.id}`);
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
