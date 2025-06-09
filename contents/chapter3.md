# Chapter 3: Customization and Publishing

Learn how to customize your book and publish it to the world.

## Book Configuration

The `config.json` file allows you to customize your book's metadata:

```json
{
  "title": "Your Book Title",
  "author": "Your Name",
  "description": "A brief description of your book",
  "theme": "auto",
  "cover": "path/to/cover.jpg"
}
```

### Configuration Options

- **title**: The main title of your book
- **author**: Your name or pen name
- **description**: A short summary that appears in the sidebar
- **theme**: Default theme (`light`, `dark`, or `auto`)
- **cover**: Optional cover image (not yet implemented)

## Chapter Organization

Use the `index.json` file to control the order of your chapters:

```json
{
  "files": ["introduction.md", "chapter1.md", "chapter2.md", "conclusion.md"]
}
```

### Filename Conventions

If you don't create an `index.json` file, the system will automatically look for files with these patterns:

- `chapter1.md`, `chapter2.md`, etc.
- `ch1.md`, `ch2.md`, etc.
- `01.md`, `02.md`, etc.
- `introduction.md`, `preface.md`
- `epilogue.md`, `conclusion.md`

## Publishing to GitHub Pages

### Initial Setup

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source
3. **Replace the content** in the `contents` folder with your own

### Automatic Deployment

Every time you push changes to the `main` branch, GitHub Actions will:

1. Build your book automatically
2. Deploy it to GitHub Pages
3. Make it available at `https://yourusername.github.io/your-repo-name`

### Custom Domain (Optional)

You can use a custom domain by:

1. Adding a `CNAME` file to the repository root
2. Configuring DNS settings with your domain provider
3. Updating the repository settings

## Reader Features

Your published book includes many advanced features:

### Reading Experience

- **Responsive design** that works on phones, tablets, and desktops
- **Customizable font size** and family
- **Adjustable line height** for better readability
- **Multiple theme options** including auto dark mode

### Navigation

- **Sidebar table of contents** with chapter list
- **Previous/Next chapter** navigation
- **Progress tracking** that remembers where you left off
- **Direct chapter jumping** from the sidebar

### Accessibility

- **Keyboard navigation** support
- **Screen reader friendly** markup
- **High contrast** options in dark mode
- **Scalable text** that respects user preferences

## Advanced Customization

### Styling

The book uses Tailwind CSS for styling. You can customize the appearance by:

1. Modifying the CSS variables in `src/index.css`
2. Updating the component styles
3. Adding custom CSS for specific elements

### Adding Features

The codebase is modular and extensible:

- Add new components in `src/components/`
- Extend functionality in `src/lib/`
- Modify the book loader for different content sources
- Add new themes or reading preferences

## Conclusion

You now have everything you need to create and publish your own book! This tool provides a solid foundation for sharing your writing with the world.

Happy writing! 📚✨
