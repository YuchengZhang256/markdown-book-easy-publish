import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Book, Chapter } from "@/types";
import { useReader } from "@/contexts/ReaderContext";
import { BookLoader } from "@/lib/bookLoader";
import { debounce } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { ReaderToolbar } from "./ReaderToolbar";
import { ChapterNavigation } from "./ChapterNavigation";

interface BookReaderProps {
  className?: string;
}

export function BookReader({ className }: BookReaderProps) {
  const {
    state,
    setLoading,
    setError,
    setCurrentChapter,
    updateProgress,
    getProgress,
  } = useReader();
  const [book, setBook] = useState<Book | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Load book on component mount
  useEffect(() => {
    const loadBookData = async () => {
      setLoading(true);
      try {
        const bookLoader = BookLoader.getInstance();
        const bookData = await bookLoader.loadBook();
        setBook(bookData);

        if (bookData.chapters.length > 0) {
          setCurrentChapter(bookData.chapters[0].id);
          setCurrentChapterIndex(0);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load book"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, []); // Remove dependencies to run only once on mount

  // Restore reading progress when chapter changes
  useEffect(() => {
    if (state.currentChapterId && contentRef.current) {
      const progress = getProgress(state.currentChapterId);
      if (progress) {
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollTop = progress.scrollPosition;
          }
        }, 100);
      }
    }
  }, [state.currentChapterId, getProgress]);

  // Track reading progress
  const trackProgress = useCallback(
    debounce(() => {
      if (state.currentChapterId && contentRef.current) {
        const scrollPosition = contentRef.current.scrollTop;
        updateProgress({
          chapterId: state.currentChapterId,
          scrollPosition,
          timestamp: Date.now(),
        });
      }
    }, 1000),
    [state.currentChapterId] // Remove updateProgress from dependencies since it's stable
  );

  const handleScroll = () => {
    trackProgress();
  };

  const currentChapter = book?.chapters.find(
    (ch) => ch.id === state.currentChapterId
  );

  const navigateToChapter = (chapterId: string) => {
    const index = book?.chapters.findIndex((ch) => ch.id === chapterId) ?? -1;
    if (index !== -1) {
      setCurrentChapter(chapterId);
      setCurrentChapterIndex(index);
      setSidebarOpen(false);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const nextChapter = () => {
    if (book && currentChapterIndex < book.chapters.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      navigateToChapter(book.chapters[nextIndex].id);
    }
  };

  const previousChapter = () => {
    if (book && currentChapterIndex > 0) {
      const prevIndex = currentChapterIndex - 1;
      navigateToChapter(book.chapters[prevIndex].id);
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            Error Loading Book
          </h2>
          <p className="text-muted-foreground mb-6">{state.error}</p>
          <div className="space-y-4">
            <p className="text-sm">To use this book reader:</p>
            <ol className="text-sm text-left space-y-2">
              <li>1. Create a `contents` folder in your repository</li>
              <li>
                2. Add your Markdown files (e.g., chapter1.md, chapter2.md)
              </li>
              <li>
                3. Optionally create config.json and index.json for
                customization
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!book || !currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Content Found</h2>
          <p className="text-muted-foreground">
            Please add Markdown files to the contents folder.
          </p>
        </div>
      </div>
    );
  }

  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  }[state.settings.fontSize];

  const fontFamilyClass = {
    serif: "font-serif",
    "sans-serif": "font-sans",
    mono: "font-mono",
  }[state.settings.fontFamily];

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      <Sidebar
        book={book}
        currentChapterId={state.currentChapterId}
        onChapterSelect={navigateToChapter}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <ReaderToolbar
          book={book}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Reading Area */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={contentRef}
            className="h-full overflow-y-auto px-6 py-8"
            onScroll={handleScroll}
          >
            <div
              className={`mx-auto prose prose-slate dark:prose-invert ${fontSizeClass} ${fontFamilyClass}`}
              style={{
                maxWidth: state.settings.maxWidth,
                lineHeight: state.settings.lineHeight,
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                className="reading-content"
              >
                {currentChapter.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Chapter Navigation */}
        <ChapterNavigation
          currentChapterIndex={currentChapterIndex}
          totalChapters={book.chapters.length}
          onPrevious={previousChapter}
          onNext={nextChapter}
          hasNext={currentChapterIndex < book.chapters.length - 1}
          hasPrevious={currentChapterIndex > 0}
        />
      </div>
    </div>
  );
}
