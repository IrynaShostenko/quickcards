import { useEffect, useState } from "react";

import { deleteDeck, getDeckById, getDecksList } from "./api/decksApi";
import { getPublicDeck } from "./api/publicApi";
import { editorMessages } from "./constants/uiText";

import DashboardPage from "./features/dashboard/DashboardPage";
import DeckEditorPage from "./features/decks/DeckEditorPage";
import PracticeLoadingPage from "./features/practice/PracticeLoadingPage";
import PracticeNotFoundPage from "./features/practice/PracticeNotFoundPage";
import StudentDeck from "./features/practice/StudentDeck";

import { useDeckEditor } from "./hooks/useDeckEditor";

function getRouteFromHash(hash) {
  const hashPath = hash.replace("#", "");
  const pathParts = hashPath.split("/").filter(Boolean);

  const routeName = pathParts[0] || "editor";
  const routeValue = pathParts[1] || null;

  return {
    routeName,
    routeValue,
    isDashboardView: routeName === "dashboard",
    practiceDeckId: routeName === "practice" ? routeValue : null,
    editDeckId: routeName === "edit" ? routeValue : null,
  };
}

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  const {
    isDashboardView,
    practiceDeckId,
    editDeckId,
  } = getRouteFromHash(currentHash);

  const isStudentOnlyView = Boolean(practiceDeckId);

  const [isPracticePreviewMode, setIsPracticePreviewMode] = useState(false);

  const [studentDeck, setStudentDeck] = useState(null);
  const [isLoadingStudentDeck, setIsLoadingStudentDeck] = useState(false);

  const [isLoadingEditDeck, setIsLoadingEditDeck] = useState(false);

  const [dashboardDecks, setDashboardDecks] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState("");
  const [copiedDeckId, setCopiedDeckId] = useState(null);

  const editor = useDeckEditor({ isStudentOnlyView });
  const { loadDeckIntoEditor, setSaveMessage } = editor;

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      setIsPracticePreviewMode(false);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!practiceDeckId) return;

    let shouldIgnoreResult = false;

    const loadStudentDeck = async () => {
      setIsLoadingStudentDeck(true);

      try {
        const publicDeck = await getPublicDeck(practiceDeckId);

        if (!shouldIgnoreResult) {
          setStudentDeck(publicDeck);
        }
      } catch (error) {
        console.error(error);

        if (!shouldIgnoreResult) {
          setStudentDeck(null);
          setSaveMessage(editorMessages.loadPracticeError(error.message));
        }
      } finally {
        if (!shouldIgnoreResult) {
          setIsLoadingStudentDeck(false);
        }
      }
    };

    loadStudentDeck();

    return () => {
      shouldIgnoreResult = true;
    };
  }, [practiceDeckId, setSaveMessage]);

  useEffect(() => {
    if (!editDeckId) return;

    let shouldIgnoreResult = false;

    const loadEditDeck = async () => {
      setIsLoadingEditDeck(true);

      try {
        const deck = await getDeckById(editDeckId);

        if (!shouldIgnoreResult) {
          loadDeckIntoEditor(deck);
        }
      } catch (error) {
        console.error(error);

        if (!shouldIgnoreResult) {
          setSaveMessage(editorMessages.saveError(error.message));
        }
      } finally {
        if (!shouldIgnoreResult) {
          setIsLoadingEditDeck(false);
        }
      }
    };

    loadEditDeck();

    return () => {
      shouldIgnoreResult = true;
    };
  }, [editDeckId, loadDeckIntoEditor, setSaveMessage]);

  useEffect(() => {
    if (!isDashboardView) return;

    let shouldIgnoreResult = false;

    const loadDashboardDecks = async () => {
      setIsLoadingDashboard(true);
      setDashboardErrorMessage("");

      try {
        const decks = await getDecksList();

        if (!shouldIgnoreResult) {
          setDashboardDecks(decks);
        }
      } catch (error) {
        console.error(error);

        if (!shouldIgnoreResult) {
          setDashboardErrorMessage(error.message || "Could not load decks.");
        }
      } finally {
        if (!shouldIgnoreResult) {
          setIsLoadingDashboard(false);
        }
      }
    };

    loadDashboardDecks();

    return () => {
      shouldIgnoreResult = true;
    };
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

  if (editDeckId && isLoadingEditDeck) {
    return <PracticeLoadingPage />;
  }

  if (isStudentOnlyView && isLoadingStudentDeck) {
    return <PracticeLoadingPage />;
  }

  if (isStudentOnlyView && !studentDeck) {
    return <PracticeNotFoundPage message={editor.saveMessage} />;
  }

  if (isStudentOnlyView || isPracticePreviewMode) {
    return (
      <StudentDeck
        title={practiceTitle}
        description={practiceDescription}
        cards={practiceCards}
        onBackToEditor={() => setIsPracticePreviewMode(false)}
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
        if (editor.hasUnsavedChanges && !editor.savedDeck?.id) {
          const shouldDiscardChanges = window.confirm(
            "This new deck has not been saved yet. Start a new deck and discard it?",
          );

          if (!shouldDiscardChanges) return;
        }

        editor.startNewDeck();
        window.history.replaceState(null, "", window.location.pathname);
        setCurrentHash("");
      }}
      onOpenDashboard={() => {
        if (editor.hasUnsavedChanges && !editor.savedDeck?.id) {
          const shouldDiscardChanges = window.confirm(
            "This new deck has not been saved yet. Go to dashboard and discard it?",
          );

          if (!shouldDiscardChanges) return;
        }

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
      onPracticePreview={() => setIsPracticePreviewMode(true)}
      onUpdateCard={editor.updatePreviewCard}
      onDeleteCard={editor.deletePreviewCard}
      onCloseSharePanel={editor.closeSharePanel}
    />
  );
}