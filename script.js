// Variables
const input = document.querySelector(".search-bar");
const form = document.getElementById("search-form");
const helpDialog = document.getElementById("help");
const closeHelpBtn = document.getElementById("close-help");
const calcGhostEl = document.getElementById("calc-ghost");
const calcPanelEl = document.getElementById("calc-panel");
const quoteDiv = document.getElementById("quote");

// Constants

const engineOrder = ["e", "g", "ddg", "brave", "bing", "w", "yt", "git", "x"];
let defaultEngine = "e";

// Bookmarks
const bookmarks = [
  {
    cmd: "git me",
    url: "https://github.com/abhinavthedev",
  },
];

// Quotes (offline)
const quotes = [
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

// Rotating placeholders (kept subtle)
const placeholders = [
  "What are you curious about today?",
  "Discover something new...",
  "Search for answers, not just links...",
  "Type your thoughts and hit enter!",
];

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
 * Render the quotes in Page
 */
function renderQuote() {
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

window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.length !== 1) return;
  input.value += e.key;
  input.focus();
  e.preventDefault();
});

// Escape + Help
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (document.activeElement === input && input.value) {
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

setRandomPlaceholder();
maybeCalcPreview(""); // ensure hidden on load
