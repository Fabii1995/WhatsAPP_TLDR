// All WhatsApp Web DOM selectors live here; WhatsApp changes its markup often.
const SEL = {
  messageRow: "[data-id]",
  // Text of a message bubble (WhatsApp marks the copyable text container).
  messageText: "span.selectable-text.copyable-text, [data-testid='selectable-text']",
  bubble: ".copyable-text, [data-pre-plain-text]",
};

let settings = { enabled: true, minLines: 12, minChars: 150 };
const cache = new Map(); // text -> summary

function loadSettings() {
  chrome.storage.local.get(["enabled", "minLines", "minChars"], (s) => {
    settings = {
      enabled: s.enabled !== false,
      minLines: Number(s.minLines) || 12,
      minChars: Number(s.minChars) || 150,
    };
    scan();
  });
}
chrome.storage.onChanged.addListener(loadSettings);

// Reconstruct message text with line breaks (WhatsApp uses <br> inside the text span).
function getText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  clone.querySelectorAll("img[alt]").forEach((img) => img.replaceWith(img.alt));
  return clone.textContent;
}

function messageTextEl(row) {
  // Use the outermost text container; ignore quoted replies by taking the last one.
  const els = row.querySelectorAll(SEL.messageText);
  return els.length ? els[els.length - 1] : null;
}

function addButton(row, textEl) {
  const holder = textEl.closest(SEL.bubble) || textEl.parentElement;
  if (!holder || !holder.parentElement) return;

  const wrap = document.createElement("div");
  wrap.className = "tldr-wrap";
  const btn = document.createElement("button");
  btn.className = "tldr-btn";
  btn.type = "button";
  btn.textContent = "TLDR";
  wrap.appendChild(btn);
  holder.parentElement.insertBefore(wrap, holder);

  const card = document.createElement("div");
  card.className = "tldr-card";
  card.hidden = true;
  card.dir = "auto";
  wrap.appendChild(card);

  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!card.hidden) {
      card.hidden = true;
      btn.textContent = "TLDR";
      return;
    }
    const text = getText(textEl).trim();
    card.hidden = false;
    btn.textContent = "Hide TLDR";
    if (cache.has(text)) {
      card.className = "tldr-card";
      card.textContent = cache.get(text);
      return;
    }
    card.className = "tldr-card tldr-loading";
    card.textContent = "Summarizing...";
    btn.disabled = true;
    try {
      const res = await chrome.runtime.sendMessage({ type: "summarize", text });
      if (!res?.ok) throw new Error(res?.error || "Unknown error");
      cache.set(text, res.summary);
      card.className = "tldr-card";
      card.textContent = res.summary;
    } catch (err) {
      card.className = "tldr-card tldr-error";
      card.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
}

function processRow(row) {
  if (row.dataset.tldr) return;
  const textEl = messageTextEl(row);
  if (!textEl) return;
  const text = getText(textEl);
  row.dataset.tldr = "1"; // mark checked so we don't re-add buttons
  if (isLong(text, settings)) addButton(row, textEl);
}

function scan() {
  if (!settings.enabled) {
    document.querySelectorAll(".tldr-wrap").forEach((w) => w.remove());
    document.querySelectorAll("[data-tldr]").forEach((r) => delete r.dataset.tldr);
    return;
  }
  document.querySelectorAll(SEL.messageRow).forEach(processRow);
}

let timer = null;
new MutationObserver(() => {
  clearTimeout(timer);
  timer = setTimeout(scan, 300);
}).observe(document.body, { childList: true, subtree: true });

loadSettings();
