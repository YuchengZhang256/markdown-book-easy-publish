import { Book, Chapter, BookConfig } from "@/types";

export class BookLoader {
  private static instance: BookLoader;
  private book: Book | null = null;
  private config: BookConfig | null = null;

  static getInstance(): BookLoader {
    if (!BookLoader.instance) {
      BookLoader.instance = new BookLoader();
    }
    return BookLoader.instance;
  }

  async loadBook(): Promise<Book> {
    if (this.book) {
      return this.book;
    }

    try {
      // Load book configuration
      await this.loadConfig();

      // Load chapters from contents directory
      const chapters = await this.loadChapters();

      this.book = {
        title: this.config?.title || "Untitled Book",
        author: this.config?.author,
        description: this.config?.description,
        chapters: chapters.sort((a, b) => a.order - b.order),
      };

      return this.book;
    } catch (error) {
      console.error("Failed to load book:", error);
      throw new Error("Failed to load book content");
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch("./contents/config.json");
      if (response.ok) {
        this.config = await response.json();
      } else {
        // Use default config if not found
        this.config = {
          title: "My Book",
          author: "Unknown Author",
          description: "A wonderful book created with Markdown Book Publisher",
        };
      }
    } catch (error) {
      console.warn("No config.json found, using defaults");
      this.config = {
        title: "My Book",
        author: "Unknown Author",
        description: "A wonderful book created with Markdown Book Publisher",
      };
    }
  }

  private async loadChapters(): Promise<Chapter[]> {
    try {
      // Try to load chapters index
      const indexResponse = await fetch("./contents/index.json");
      if (indexResponse.ok) {
        const index = await indexResponse.json();
        return await this.loadChaptersFromIndex(index);
      }
    } catch (error) {
      console.warn("No index.json found, scanning for markdown files");
    }

    // Fallback: try to load common chapter filenames
    return await this.loadChaptersFromFilenames();
  }

  private async loadChaptersFromIndex(index: {
    files: string[];
  }): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    for (let i = 0; i < index.files.length; i++) {
      const fileName = index.files[i];
      try {
        const response = await fetch(`./contents/${fileName}`);
        if (response.ok) {
          const content = await response.text();
          const title = this.extractTitle(content, fileName);

          chapters.push({
            id: `chapter-${i + 1}`,
            title,
            content,
            order: i + 1,
            fileName,
          });
        }
      } catch (error) {
        console.warn(`Failed to load chapter: ${fileName}`);
      }
    }

    return chapters;
  }

  private async loadChaptersFromFilenames(): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    const commonFilenames = [
      // Basic numbered patterns
      "chapter1.md",
      "chapter2.md",
      "chapter3.md",
      "chapter4.md",
      "chapter5.md",
      "chapter6.md",
      "chapter7.md",
      "chapter8.md",
      "chapter9.md",
      "chapter10.md",
      "ch1.md",
      "ch2.md",
      "ch3.md",
      "ch4.md",
      "ch5.md",
      "ch6.md",
      "ch7.md",
      "ch8.md",
      "ch9.md",
      "ch10.md",
      "01.md",
      "02.md",
      "03.md",
      "04.md",
      "05.md",
      "06.md",
      "07.md",
      "08.md",
      "09.md",
      "10.md",
      // Chinese patterns
      "第一章.md",
      "第二章.md",
      "第三章.md",
      "第四章.md",
      "第五章.md",
      "第1章.md",
      "第2章.md",
      "第3章.md",
      "第4章.md",
      "第5章.md",
      // Special chapters
      "intro.md",
      "introduction.md",
      "preface.md",
      "序言.md",
      "前言.md",
      "epilogue.md",
      "conclusion.md",
      "后记.md",
      "结语.md",
    ];

    let order = 1;
    for (const fileName of commonFilenames) {
      try {
        const response = await fetch(`./contents/${fileName}`);
        if (response.ok) {
          const content = await response.text();
          const title = this.extractTitle(content, fileName);

          chapters.push({
            id: `chapter-${order}`,
            title,
            content,
            order,
            fileName,
          });
          order++;
        }
      } catch (error) {
        // File doesn't exist, continue to next
      }
    }

    return chapters;
  }

  private extractTitle(content: string, fileName: string): string {
    // Try to extract title from first h1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Try to extract title from first h2 heading
    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h2Match) {
      return h2Match[1].trim();
    }

    // Fallback to filename
    return fileName.replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " ");
  }

  getBook(): Book | null {
    return this.book;
  }

  getConfig(): BookConfig | null {
    return this.config;
  }
}
