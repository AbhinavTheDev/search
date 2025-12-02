// Variables
const input = document.querySelector(".search-bar");
const form = document.getElementById("search-form");
const helpDialog = document.getElementById("help");
const closeHelpBtn = document.getElementById("close-help");
const calcPanelEl = document.getElementById("calc-panel");
const quoteDiv = document.getElementById("quote");

// Settings elements
const settingsBtn = document.getElementById("settings-btn");
const settingsDialog = document.getElementById("settings");
const saveSettingsBtn = document.getElementById("save-settings");
const cancelSettingsBtn = document.getElementById("cancel-settings");
const resetSettingsBtn = document.getElementById("reset-settings");
const defaultEngineSelect = document.getElementById("default-engine");
const placeholdersInput = document.getElementById("placeholders-input");
const quotesInput = document.getElementById("quotes-input");
const bookmarksInput = document.getElementById("bookmarks-input");

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
    localStorage.setItem("placeholders", JSON.stringify(placeholderLines));
    localStorage.setItem("quotes", JSON.stringify(parsedQuotes));
    localStorage.setItem("bookmarks", JSON.stringify(parsedBookmarks));

    // Update in memory
    defaultEngine = engine;
    placeholders = placeholderLines;
    quotes = parsedQuotes;
    bookmarks = parsedBookmarks;

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
  localStorage.removeItem("placeholders");
  localStorage.removeItem("quotes");
  localStorage.removeItem("bookmarks");

  defaultEngine = "e";
  placeholders = [...DEFAULT_PLACEHOLDERS];
  quotes = [...DEFAULT_QUOTES];
  bookmarks = [...DEFAULT_BOOKMARKS];

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
  quoteDiv.innerHTML = `${q.text}<span class="author">— ${q.author}</span>`;
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
    navigator.clipboard?.writeText(calcOut).catch(() => {});
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
    .catch(() => {});
});

// Settings events
settingsBtn?.addEventListener("click", () => {
  loadSettingsDialog();
  settingsDialog.showModal();
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