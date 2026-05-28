# Browsy

Browsy is a minimal vanilla HTML, CSS, and JavaScript search start page. It provides fast web search, engine prefixes, URL opening, calculator previews, quotes, theme control, and editable local settings without a build step.

## Features

- **Fast search**: Type a query and press `Enter` to search with the selected default engine.
- **Direct URL opening**: Enter a URL-like value such as `example.com` to open it directly.
- **Search prefixes**: Force a search engine by prefixing the query, for example `g css grid`, `yt lofi`, or `mdn array map`.
- **Calculator preview**: Type expressions like `= 2^10 + 5%` or `calc (12*3)/5` to preview and copy results.
- **Bookmarks**: Add custom keyword shortcuts that open saved URLs.
- **Theme modes**: Switch between system, dark, and light themes.
- **Editable content**: Customize placeholders, quotes, bookmarks, default engine, and theme from settings.
- **Keyboard shortcuts**: Open help, clear search, focus input, and search efficiently from the keyboard.
- **Lifetime counter**: Displays a configurable time-remaining counter based on the birthdate constant in `script.js`.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| `Enter` | Search, open URL, or copy calculator result |
| `Shift + Enter` | Search calculator expression instead of only copying result |
| `Esc` | Clear search, unfocus input, or close dialogs |
| `?` | Toggle the help dialog |
| Typing while unfocused | Focuses the search input and inserts the typed character |

## Search Prefixes

| Prefix | Target |
| --- | --- |
| `e` | Ecosia |
| `g` | Google |
| `ddg` | DuckDuckGo |
| `brave` | Brave Search |
| `bing` | Bing |
| `w` | Wikipedia |
| `yt` | YouTube |
| `git` | GitHub |
| `x` | X Search |
| `mdn` | MDN |
| `so` | Stack Overflow |
| `npm` | npm |

Example:

```text
mdn queryselector
```

## Settings

Open the settings button to update:

- Default search engine
- Theme preference
- Search placeholders
- Quotes
- Bookmark commands

Settings are saved in `localStorage`, so they persist in the same browser.

## Run Locally

No install or build step is required.

1. Open `index.html` in a browser.
2. Edit `index.html`, `style.css`, or `script.js` directly.
3. Refresh the browser to see changes.

## Project Structure

```text
.
├── index.html
├── script.js
├── style.css
└── README.md
```

## Notes

- The app is fully client-side.
- Custom settings are stored only in the current browser profile.
- The lifetime counter birthdate is currently set in `script.js` as `BIRTHDATE`.
