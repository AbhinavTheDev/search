// Variables
const input = document.querySelector(".search-bar");
const form = document.getElementById("search-form");
const helpDialog = document.getElementById("help");
const closeHelpBtn = document.getElementById("close-help");
const calcPanelEl = document.getElementById("calc-panel");
const quoteDiv = document.getElementById("quote");

// Settings elements
const themeBtn = document.getElementById("theme-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsDialog = document.getElementById("settings");
const saveSettingsBtn = document.getElementById("save-settings");
const cancelSettingsBtn = document.getElementById("cancel-settings");
const resetSettingsBtn = document.getElementById("reset-settings");
const defaultEngineSelect = document.getElementById("default-engine");
const themeSelect = document.getElementById("theme-preference");
const placeholdersInput = document.getElementById("placeholders-input");
const quotesInput = document.getElementById("quotes-input");
const bookmarksInput = document.getElementById("bookmarks-input");

let themePreference = localStorage.getItem("themePreference") || "system";

// Lifeline counter elements
const lifelineCounter = document.getElementById("lifeline-counter");
const yearsEl = document.getElementById("years");
const monthsEl = document.getElementById("months");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

// Default data
const DEFAULT_BOOKMARKS = [
  {
    cmd: "git me",
    url: "https://github.com/abhinavthedev",
  },
];

const DEFAULT_QUOTES = [
  {
    text: "Hilbert space is a big place.",
    author: "Carlton Caves"
  },
  {
    text: "Quantum mechanics: Real Black Magic Calculus",
    author: "Albert Einstein"
  },
  {
    text: "Life is complex - it has both real and imaginary parts.",
    author: ""
  },
  {
    text: "All understanding begins with our not accepting the world as it appears.",
    author: "Alan Kay"
  },
  {
    text: "The most incomprehensible thing about the world is that it is comprehensible.",
    author: "Albert Einstein"
  },
  {
    text: "I recall that during one walk Einstein suddenly stopped, turned to me and asked whether I really believed that the moon exists only when I look at it. The rest of this walk was devoted to a discussion of what a physicist should mean by the term 'to exist'",
    author: "Abraham Pais"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
  },
  {
    text: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
  },
  {
    text: "If you tell the truth, you don't have to remember anything.",
    author: "Mark Twain",
  },
];

const DEFAULT_PLACEHOLDERS = [
  "What are you curious about today?",
  "Discover something new...",
  "Search for answers, not just links...",
  "Type your thoughts and hit enter!",
];

// Load from localStorage or use defaults
let defaultEngine = localStorage.getItem("defaultEngine") || "e";
let bookmarks = JSON.parse(
  localStorage.getItem("bookmarks") || JSON.stringify(DEFAULT_BOOKMARKS)
);
let quotes = JSON.parse(
  localStorage.getItem("quotes") || JSON.stringify(DEFAULT_QUOTES)
);
let placeholders = JSON.parse(
  localStorage.getItem("placeholders") || JSON.stringify(DEFAULT_PLACEHOLDERS)
);

// Engines (still supported via prefixes, no on-screen chrome)
const engines = {
  e: "https://www.ecosia.org/search?q=",
  g: "https://www.google.com/search?q=",
  ddg: "https://duckduckgo.com/?q=",
  brave: "https://search.brave.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  w: "https://en.wikipedia.org/w/index.php?search=",
  yt: "https://www.youtube.com/results?search_query=",
  git: "https://github.com/search?q=",
  x: "https://x.com/search?q=",
  mdn: "https://developer.mozilla.org/search?q=",
  so: "https://stackoverflow.com/search?q=",
  npm: "https://www.npmjs.com/search?q=",
};

/**
 * Save settings to localStorage
 */
function saveSettings() {
  try {
    const engine = defaultEngineSelect.value;
    const theme = themeSelect?.value || "system";
    const placeholderLines = placeholdersInput.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const quoteLines = quotesInput.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsedQuotes = quoteLines.map((line) => JSON.parse(line));

    const bookmarkLines = bookmarksInput.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsedBookmarks = bookmarkLines.map((line) => JSON.parse(line));

    // Validate
    if (placeholderLines.length === 0)
      throw new Error("Add at least one placeholder");
    if (parsedQuotes.length === 0) throw new Error("Add at least one quote");
    if (!parsedQuotes.every((q) => q.text && q.author))
      throw new Error("Quotes must have text and author");
    if (!parsedBookmarks.every((b) => b.cmd && b.url))
      throw new Error("Bookmarks must have cmd and url");

    // Save
    localStorage.setItem("defaultEngine", engine);
    localStorage.setItem("themePreference", theme);
    localStorage.setItem("placeholders", JSON.stringify(placeholderLines));
    localStorage.setItem("quotes", JSON.stringify(parsedQuotes));
    localStorage.setItem("bookmarks", JSON.stringify(parsedBookmarks));

    // Update in memory
    defaultEngine = engine;
    themePreference = theme;
    placeholders = placeholderLines;
    quotes = parsedQuotes;
    bookmarks = parsedBookmarks;

    applyTheme(themePreference);
    updateThemeButton();

    showToast("Settings saved!");
    settingsDialog.close();

    // Refresh UI
    renderQuote();
    setRandomPlaceholder();
  } catch (err) {
    showToast(`Error: ${err.message}`);
  }
}

/**
 * Load settings into the dialog
 */
function loadSettingsDialog() {
  defaultEngineSelect.value = defaultEngine;
  themeSelect.value = themePreference;
  placeholdersInput.value = placeholders.join("\n");
  quotesInput.value = quotes.map((q) => JSON.stringify(q)).join("\n");
  bookmarksInput.value = bookmarks.map((b) => JSON.stringify(b)).join("\n");
}

/**
 * Reset to defaults
 */
function resetSettings() {
  if (!confirm("Reset all settings to default?")) return;

  localStorage.removeItem("defaultEngine");
  localStorage.removeItem("themePreference");
  localStorage.removeItem("placeholders");
  localStorage.removeItem("quotes");
  localStorage.removeItem("bookmarks");

  defaultEngine = "e";
  themePreference = "system";
  placeholders = [...DEFAULT_PLACEHOLDERS];
  quotes = [...DEFAULT_QUOTES];
  bookmarks = [...DEFAULT_BOOKMARKS];

  applyTheme(themePreference);
  updateThemeButton();
  loadSettingsDialog();
  showToast("Settings reset!");
}

/**
 * Render the quotes in Page
 */
function renderQuote() {
  if (quotes.length === 0) return;
  let quoteIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[quoteIndex];
  if (!quoteDiv) return;
  quoteDiv.innerHTML = `<p>${q.text}</p><cite class="author">— ${q.author}</cite>`;
  document.title = q.text;
}

/**
 * Set Search Bar placeholders
 */
function setRandomPlaceholder() {
  if (placeholders.length === 0) return;
  const p = placeholders[Math.floor(Math.random() * placeholders.length)];
  input.setAttribute("placeholder", p);
}

/**
 * Set engine to be used in search bar
 * @param {string} key
 */
function setEngine(key) {
  if (!engines[key]) return;
  defaultEngine = key;
}

renderQuote();
setEngine(defaultEngine);
applyTheme(themePreference);
updateThemeButton();

const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
systemMedia.addEventListener?.("change", () => {
  if (themePreference === "system") applyTheme("system");
});

/**
 * Use bookmarks from search bar
 * @param {string} trimmed
 * @returns {boolean}
 */
function handleBookmarks(trimmed) {
  const query = trimmed.toLowerCase();
  for (let i = 0; i < bookmarks.length; i++) {
    if (bookmarks[i].cmd === query) {
      window.location.href = bookmarks[i].url;
      return true;
    }
  }
  return false;
}

// Calculator: parse and show a separate result panel
const calcAllowed = /^[\d\s()+\-*/^%.]+$/;

const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 10 });
function formatCalcNumber(val) {
  if (!Number.isFinite(val)) return null;
  const abs = Math.abs(val);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) {
    return val
      .toExponential(10)
      .replace(/(\.\d*?[1-9])0+e/, "$1e")
      .replace(/\.e/, "e");
  }
  return nf.format(val);
}

function escapeHTML(s) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
      c
    ])
  );
}

let lastCalcOut = null;

function maybeCalcPreview(q) {
  const trimmed = q.trim();
  let expr = "";
  if (trimmed.startsWith("=")) expr = trimmed.slice(1).trim();
  else if (trimmed.toLowerCase().startsWith("calc "))
    expr = trimmed.slice(5).trim();
  else if (calcAllowed.test(trimmed) && /[0-9][+\-*/^%()]/.test(trimmed))
    expr = trimmed;

  if (!expr || !calcAllowed.test(expr)) {
    calcPanelEl?.setAttribute("hidden", "");
    lastCalcOut = null;
    return null;
  }

  try {
    const safe = expr.replace(/\^/g, "**");
    // eslint-disable-next-line no-new-func
    const res = Function(`"use strict"; return (${safe});`)();
    const val = Number(res);
    const out = formatCalcNumber(val);
    if (out == null) throw new Error("Not finite");

    if (calcPanelEl) {
      calcPanelEl.innerHTML = `
        <div class="calc-expr">${escapeHTML(expr)}</div>
        <div class="calc-out">= ${escapeHTML(out)}</div>
      `;
      calcPanelEl.removeAttribute("hidden");
      calcPanelEl.classList.add("copy");
    }
    lastCalcOut = out;
    return out;
  } catch {
    calcPanelEl?.setAttribute("hidden", "");
    lastCalcOut = null;
    return null;
  }
}

function applyTheme(pref) {
  if (!pref) pref = "system";
  document.documentElement.dataset.theme = pref;
}

function updateThemeButton() {
  if (!themeBtn) return;
  const icons = {
    system: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
		<path d="M9.173 14.83a4 4 0 1 1 5.657-5.657" />
		<path d="m11.294 12.707l.174.247a7.5 7.5 0 0 0 8.845 2.492A9 9 0 0 1 5.642 18.36M3 12h1m8-9v1M5.6 5.6l.7.7M3 21L21 3" />
	</g>
</svg>`,
    dark: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M12 22c5.523 0 10-4.477 10-10c0-.463-.694-.54-.933-.143a6.5 6.5 0 1 1-8.924-8.924C12.54 2.693 12.463 2 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10" />
</svg>`,
    light: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M18 12a6 6 0 1 1-12 0a6 6 0 0 1 12 0" />
	<path fill="currentColor" fill-rule="evenodd" d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75" clip-rule="evenodd" />
</svg>`,
  };
  const labels = {
    system: "Auto",
    dark: "Dark",
    light: "Light",
  };
  const label = labels[themePreference] || "Auto";
  const icon = icons[themePreference] || icons.system;
  themeBtn.innerHTML = icon.trim();
  themeBtn.title = `Theme: ${label}`;
  themeBtn.setAttribute("aria-label", `Theme: ${label}`);
}

function setThemePreference(pref) {
  themePreference = pref || "system";
  localStorage.setItem("themePreference", themePreference);
  applyTheme(themePreference);
  updateThemeButton();
}

function showToast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 220);
  }, 1400);
}

function looksLikeUrl(q) {
  if (/^\w+:\/\//i.test(q)) return true;
  if (/^[\w-]+(\.[\w-]+)+.*$/i.test(q) && !/\s/.test(q)) return true;
  return false;
}

function toAbsoluteUrl(q) {
  return /^\w+:\/\//i.test(q) ? q : `https://${q}`;
}

function handleSearch(query, opts = { shiftKey: false }) {
  const trimmed = query.trim();
  if (!trimmed) return;
  if (handleBookmarks(trimmed)) return;
  const parts = trimmed.split(/\s+/);
  const maybePrefix = parts[0].toLowerCase();

  const calcOut = maybeCalcPreview(trimmed);
  const isCalc =
    trimmed.startsWith("=") ||
    trimmed.toLowerCase().startsWith("calc ") ||
    (calcOut !== null && calcAllowed.test(trimmed));

  if (isCalc && calcOut !== null) {
    navigator.clipboard?.writeText(calcOut).catch(() => { });
    showToast(`Copied: ${calcOut}`);
    if (opts.shiftKey) {
      const expr = trimmed.replace(/^=|^calc\s+/i, "");
      window.location.href = `${engines[defaultEngine]}${encodeURIComponent(
        expr
      )}`;
    }
    return;
  }

  if (engines[maybePrefix] && parts.length > 1) {
    const rest = parts.slice(1).join(" ");
    window.location.href = `${engines[maybePrefix]}${encodeURIComponent(rest)}`;
    return;
  }

  if (looksLikeUrl(trimmed)) {
    window.location.href = toAbsoluteUrl(trimmed);
    return;
  }

  window.location.href = `${engines[defaultEngine]}${encodeURIComponent(
    trimmed
  )}`;
}

// Events
form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch(input.value, { shiftKey: e.shiftKey });
});

input.addEventListener("input", () => {
  maybeCalcPreview(input.value);
});

// Click-to-copy on the calc panel
calcPanelEl?.addEventListener("click", () => {
  if (!lastCalcOut) return;
  navigator.clipboard
    ?.writeText(lastCalcOut)
    .then(() => showToast(`Copied: ${lastCalcOut}`))
    .catch(() => { });
});

// Settings events
settingsBtn?.addEventListener("click", () => {
  loadSettingsDialog();
  settingsDialog.showModal();
});

themeBtn?.addEventListener("click", () => {
  const nextTheme =
    themePreference === "system"
      ? "dark"
      : themePreference === "dark"
        ? "light"
        : "system";
  setThemePreference(nextTheme);
  showToast(`Theme: ${nextTheme === "system" ? "System" : nextTheme}`);
});

saveSettingsBtn?.addEventListener("click", saveSettings);
cancelSettingsBtn?.addEventListener("click", () => settingsDialog.close());
resetSettingsBtn?.addEventListener("click", resetSettings);

window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (settingsDialog?.open || helpDialog?.open) return;
  if (e.key.length !== 1) return;
  input.value += e.key;
  input.focus();
  e.preventDefault();
});

// Escape + Help
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (settingsDialog?.open) {
      settingsDialog.close();
    } else if (document.activeElement === input && input.value) {
      input.value = "";
      maybeCalcPreview("");
    } else if (document.activeElement === input) {
      input.blur();
    } else if (helpDialog?.open) {
      helpDialog.close();
    }
  }
});

window.addEventListener("keydown", (e) => {
  const key = e.key;
  const isQuestionMark = key === "?" || (key === "/" && e.shiftKey);
  if (isQuestionMark) {
    e.preventDefault();
    if (helpDialog?.open) helpDialog.close();
    else helpDialog?.showModal();
  }
});

closeHelpBtn?.addEventListener("click", () => helpDialog.close());

// Birthdate constant - UPDATE THIS WITH YOUR ACTUAL BIRTHDATE
const BIRTHDATE = new Date("2005-08-12"); // Format: YYYY-MM-DD

/**
 * Calculate and update lifeline counter
 */
function updateLifelineCounter() {
  const targetAge = 100;
  const targetDate = new Date(BIRTHDATE);
  targetDate.setFullYear(BIRTHDATE.getFullYear() + targetAge);

  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    // Time's up
    yearsEl.textContent = "0";
    monthsEl.textContent = "0";
    daysEl.textContent = "0";
    hoursEl.textContent = "0";
    minutesEl.textContent = "0";
    secondsEl.textContent = "0";
    return;
  }

  // Calculate time remaining
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);

  // Calculate days, months, and years more accurately
  let years = targetDate.getFullYear() - now.getFullYear();
  let months = targetDate.getMonth() - now.getMonth();
  let days = targetDate.getDate() - now.getDate();

  // Adjust for negative values
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Update DOM
  yearsEl.textContent = years;
  monthsEl.textContent = months;
  daysEl.textContent = days;
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

// Start the lifeline counter
updateLifelineCounter();
setInterval(updateLifelineCounter, 1000);

setRandomPlaceholder();
maybeCalcPreview(""); // ensure hidden on load