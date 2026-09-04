import { getDamEnabled, setDamEnabled, initDefaults } from "../storage/settings";
import { getApiKey, setApiKey, getProvider, setProvider, getModel, setModel } from "../api/damApi";
import type { HostAdapter } from "./hostAdapter";
import { ChatGPTAdapter } from "./adapters/chatgpt";
import { ClaudeAdapter } from "./adapters/claude";

let currentEnabled = false;
let currentAdapter: HostAdapter | null = null;
let flowActive = false;

function getAdapter(): HostAdapter | null {
  if (currentAdapter) return currentAdapter;
  if (location.hostname === "chatgpt.com") {
    currentAdapter = new ChatGPTAdapter();
    return currentAdapter;
  }
  if (location.hostname === "claude.ai") {
    currentAdapter = new ClaudeAdapter();
    return currentAdapter;
  }
  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById("dam-ai-styles")) return;
  const s = document.createElement("style");
  s.id = "dam-ai-styles";
  s.textContent = `
/* ── Toggle ── */
.dam-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #8e8ea0;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  user-select: none;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1;
  flex-shrink: 0;
  margin-left: 4px;
}
.dam-toggle:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
.dam-toggle[data-active="true"] {
  background: rgba(130,87,229,0.18);
  border-color: rgba(130,87,229,0.4);
  color: #b4a0e8;
}
.dam-toggle-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: currentColor;
  transition: background .15s;
}
.dam-toggle[data-active="true"] .dam-toggle-dot { background: #a78bfa; }
.dam-toggle-settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent;
  color: #6b6b80;
  font-size: 12px;
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
  margin-left: 2px;
}
.dam-toggle-settings:hover { background: rgba(255,255,255,0.06); color: #999; }

/* ── Backdrop ── */
.dam-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 99998;
  animation: damFadeIn .2s ease;
}
@keyframes damFadeIn { from { opacity: 0 } to { opacity: 1 } }

/* ── Modal ── */
.dam-modal {
  position: fixed;
  top: 42%; left: 50%;
  transform: translate(-50%, -50%);
  width: 480px; max-width: calc(100vw - 32px);
  max-height: calc(100vh - 120px);
  background: #2f2f2f;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  z-index: 99999;
  display: flex; flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #ececec;
  animation: damModalIn .25s cubic-bezier(.16,1,.3,1);
}
@keyframes damModalIn {
  from { opacity: 0; transform: translate(-50%,-50%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%,-50%) scale(1); }
}
.dam-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.dam-modal-title {
  font-size: 15px; font-weight: 600; color: #ececec;
  display: flex; align-items: center; gap: 8px;
}
.dam-modal-title-icon { font-size: 16px; }
.dam-modal-close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: none;
  background: transparent; color: #6b6b80;
  font-size: 18px; cursor: pointer;
  transition: all .12s;
}
.dam-modal-close:hover { background: rgba(255,255,255,0.06); color: #ccc; }

/* ── Modal Body ── */
.dam-modal-body {
  padding: 24px 22px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* ── Loading ── */
.dam-loading {
  display: flex; flex-direction: column;
  align-items: center; gap: 20px;
  padding: 48px 24px;
  text-align: center;
}
.dam-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid rgba(255,255,255,0.08);
  border-top-color: rgba(130,87,229,0.7);
  border-radius: 50%;
  animation: damSpin .7s linear infinite;
}
@keyframes damSpin { to { transform: rotate(360deg); } }
.dam-loading-title {
  font-size: 15px; font-weight: 500; color: #d4d4d4;
}
.dam-loading-sub {
  font-size: 13px; color: #888; line-height: 1.5;
}
.dam-loading-steps {
  display: flex; flex-direction: column; gap: 6px;
  margin-top: 4px;
}
.dam-loading-step {
  font-size: 12px; color: #666;
  display: flex; align-items: center; gap: 6px;
}
.dam-loading-step[data-done="true"] { color: #8e8ea0; }
.dam-loading-step-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #555; flex-shrink: 0;
}
.dam-loading-step[data-done="true"] .dam-loading-step-dot { background: #a78bfa; }

/* ── Question ── */
.dam-question-text {
  font-size: 16px; font-weight: 500; line-height: 1.45;
  margin-bottom: 18px; color: #ececec;
}
.dam-option {
  display: block; width: 100%;
  padding: 11px 15px; margin-bottom: 7px;
  text-align: left;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: #d4d4d4; font-size: 14px; font-family: inherit;
  cursor: pointer;
  transition: all .1s;
}
.dam-option:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.15);
  color: #ececec;
}
.dam-option[data-selected="true"] {
  background: rgba(130,87,229,0.2);
  border-color: rgba(130,87,229,0.5);
  color: #fff;
}
.dam-other-input {
  width: 100%; padding: 10px 14px; margin-top: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: #ececec; font-size: 14px; font-family: inherit;
  outline: none; box-sizing: border-box;
}
.dam-other-input:focus { border-color: rgba(130,87,229,0.5); }
.dam-other-input::placeholder { color: #555; }

/* ── Modal Footer ── */
.dam-modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.dam-modal-footer-left, .dam-modal-footer-right {
  display: flex; gap: 8px;
}
.dam-btn {
  padding: 7px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #999;
  font-size: 13px; font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all .1s;
}
.dam-btn:hover { background: rgba(255,255,255,0.05); color: #ccc; }
.dam-btn-primary {
  background: rgba(130,87,229,0.25);
  border-color: rgba(130,87,229,0.45);
  color: #c9a8ff;
}
.dam-btn-primary:hover { background: rgba(130,87,229,0.35); }
.dam-btn-skip {
  background: transparent;
  border-color: rgba(255,255,255,0.06);
  color: #666;
}
.dam-btn-skip:hover { color: #999; border-color: rgba(255,255,255,0.12); }
.dam-progress {
  font-size: 12px; color: #666; font-variant-numeric: tabular-nums;
}

/* ── Toast ── */
.dam-toast {
  position: fixed;
  bottom: 88px; left: 50%;
  transform: translateX(-50%);
  padding: 10px 22px;
  background: #3a3a3a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  font-size: 13px; color: #d4d4d4;
  z-index: 100000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  animation: damToastIn .25s cubic-bezier(.16,1,.3,1);
}
@keyframes damToastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Settings Modal ── */
.dam-settings-label {
  display: block; font-size: 12px; color: #888;
  margin-bottom: 5px; margin-top: 14px;
  font-weight: 500;
}
.dam-settings-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: #ececec; font-size: 14px; font-family: inherit;
  outline: none; box-sizing: border-box;
}
.dam-settings-input:focus { border-color: rgba(130,87,229,0.5); }
.dam-settings-select {
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(40,40,40,1);
  color: #ececec; font-size: 14px; font-family: inherit;
  outline: none; box-sizing: border-box;
  appearance: auto;
}
.dam-provider-row {
  display: flex; gap: 8px;
}
.dam-provider-btn {
  flex: 1; padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  color: #888; font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer;
  transition: all .12s; text-align: center;
}
.dam-provider-btn:hover { border-color: rgba(255,255,255,0.18); color: #bbb; }
.dam-provider-btn[data-active="true"] {
  background: rgba(130,87,229,0.18);
  border-color: rgba(130,87,229,0.45);
  color: #c9a8ff;
}
  `;
  document.head.appendChild(s);
}

// ─── Helpers ──────────────────────────────────────────────────────────
function $(sel: string, root: ParentNode = document): HTMLElement | null {
  return root.querySelector(sel);
}
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  children.forEach((c) => {
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

function removeExisting(selector: string) {
  document.querySelectorAll(selector).forEach((e) => e.remove());
}

// ─── Toggle ───────────────────────────────────────────────────────────
function renderToggle() {
  if ($(".dam-toggle")) return;
  const adapter = getAdapter();
  if (!adapter) return;

  const sendBtn = adapter.findSendButton();
  if (!sendBtn) {
    console.log("[DAM AI] No send button found, cannot mount toggle");
    return;
  }

  // Insert toggle before the send button's parent container
  const parent = sendBtn.parentElement;
  if (!parent) return;

  const wrap = el("div", { style: "display:inline-flex;align-items:center;gap:3px;margin-right:6px" });

  const btn = el("button", {
    class: "dam-toggle",
    "data-active": String(currentEnabled),
    "aria-label": "DAM AI",
    title: "DAM AI — improve prompts before sending",
  });
  btn.innerHTML = `<span class="dam-toggle-dot"></span>DAM AI`;

  btn.addEventListener("click", async () => {
    currentEnabled = !currentEnabled;
    await setDamEnabled(currentEnabled);
    btn.setAttribute("data-active", String(currentEnabled));
  });

  const gear = el("button", {
    class: "dam-toggle-settings",
    "aria-label": "DAM AI Settings",
    title: "DAM AI Settings",
  });
  gear.textContent = "\u2699";
  gear.addEventListener("click", openSettings);

  wrap.appendChild(btn);
  wrap.appendChild(gear);
  parent.insertBefore(wrap, sendBtn);
  console.log("[DAM AI] Toggle mounted next to send button");
}

// ─── Settings ─────────────────────────────────────────────────────────
async function openSettings() {
  removeExisting(".dam-backdrop");
  removeExisting(".dam-modal");

  const backdrop = el("div", { class: "dam-backdrop" });
  backdrop.addEventListener("click", closeAll);
  document.body.appendChild(backdrop);

  const modal = el("div", { class: "dam-modal" });
  modal.style.width = "420px";

  // Header
  const header = el("div", { class: "dam-modal-header" });
  header.appendChild(el("span", { class: "dam-modal-title" }, "Settings"));
  const closeBtn = el("button", { class: "dam-modal-close" }, "\u00d7");
  closeBtn.addEventListener("click", closeAll);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = el("div", { class: "dam-modal-body" });

  // Provider
  body.appendChild(el("label", { class: "dam-settings-label" }, "Provider"));
  const provRow = el("div", { class: "dam-provider-row" });
  let curProvider: "gemini" | "groq" = "groq";

  const groqBtn = el("button", { class: "dam-provider-btn", "data-active": "true" }, "Groq (Free)");
  const geminiBtn = el("button", { class: "dam-provider-btn" }, "Gemini");

  groqBtn.addEventListener("click", () => {
    curProvider = "groq";
    groqBtn.setAttribute("data-active", "true");
    geminiBtn.setAttribute("data-active", "false");
    refreshModelOptions();
  });
  geminiBtn.addEventListener("click", () => {
    curProvider = "gemini";
    geminiBtn.setAttribute("data-active", "true");
    groqBtn.setAttribute("data-active", "false");
    refreshModelOptions();
  });

  provRow.appendChild(groqBtn);
  provRow.appendChild(geminiBtn);
  body.appendChild(provRow);

  // API Key
  body.appendChild(el("label", { class: "dam-settings-label" }, "API Key"));
  const keyInput = el("input", {
    class: "dam-settings-input",
    type: "password",
    placeholder: "gsk_... or AIza...",
  }) as HTMLInputElement;
  body.appendChild(keyInput);

  // Model
  body.appendChild(el("label", { class: "dam-settings-label" }, "Model"));
  const modelSelect = el("select", { class: "dam-settings-select" }) as HTMLSelectElement;
  body.appendChild(modelSelect);

  const GROQ_MODELS = [
    { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B (Fast)" },
    { value: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B" },
    { value: "qwen/qwen3.8-27b", label: "Qwen 3.8 27B" },
    { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B (Best)" },
  ];
  const GEMINI_MODELS = [
    { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
    { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  ];

  function refreshModelOptions() {
    modelSelect.innerHTML = "";
    const models = curProvider === "groq" ? GROQ_MODELS : GEMINI_MODELS;
    models.forEach((m) => {
      modelSelect.appendChild(el("option", { value: m.value }, m.label));
    });
  }

  // Load saved values
  const [savedProvider, savedKey, savedModel] = await Promise.all([
    getProvider(),
    getApiKey(),
    getModel(),
  ]);
  curProvider = savedProvider;
  groqBtn.setAttribute("data-active", String(curProvider === "groq"));
  geminiBtn.setAttribute("data-active", String(curProvider === "gemini"));
  keyInput.value = savedKey;
  refreshModelOptions();
  if (savedModel && modelSelect.querySelector(`option[value="${savedModel}"]`)) {
    modelSelect.value = savedModel;
  }

  modal.appendChild(body);

  // Footer
  const footer = el("div", { class: "dam-modal-footer" });
  const left = el("div", { class: "dam-modal-footer-left" });
  const right = el("div", { class: "dam-modal-footer-right" });

  const cancelBtn = el("button", { class: "dam-btn" }, "Cancel");
  cancelBtn.addEventListener("click", closeAll);

  const saveBtn = el("button", { class: "dam-btn dam-btn-primary" }, "Save");
  saveBtn.addEventListener("click", async () => {
    saveBtn.textContent = "Saving...";
    await setProvider(curProvider);
    await setApiKey(keyInput.value.trim());
    await setModel(modelSelect.value);
    saveBtn.textContent = "Saved!";
    setTimeout(closeAll, 600);
  });

  left.appendChild(cancelBtn);
  right.appendChild(saveBtn);
  footer.appendChild(left);
  footer.appendChild(right);
  modal.appendChild(footer);

  document.body.appendChild(modal);
}

function closeAll() {
  removeExisting(".dam-backdrop");
  removeExisting(".dam-modal");
}

// ─── Toast ────────────────────────────────────────────────────────────
function showToast(msg: string) {
  const t = el("div", { class: "dam-toast" }, msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ─── Loading Modal ────────────────────────────────────────────────────
function showLoading(title: string, sub: string, steps?: string[]): HTMLElement {
  removeExisting(".dam-backdrop");
  removeExisting(".dam-modal");

  const backdrop = el("div", { class: "dam-backdrop" });
  document.body.appendChild(backdrop);

  const modal = el("div", { class: "dam-modal" });

  // Header with close
  const header = el("div", { class: "dam-modal-header" });
  const titleWrap = el("span", { class: "dam-modal-title" });
  titleWrap.appendChild(el("span", { class: "dam-modal-title-icon" }, "\u2728"));
  titleWrap.appendChild(document.createTextNode("DAM AI"));
  header.appendChild(titleWrap);
  const closeBtn = el("button", { class: "dam-modal-close" }, "\u00d7");
  closeBtn.addEventListener("click", () => {
    closeAll();
    flowActive = false;
  });
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = el("div", { class: "dam-modal-body" });
  const loading = el("div", { class: "dam-loading" });
  loading.appendChild(el("div", { class: "dam-spinner" }));
  loading.appendChild(el("div", { class: "dam-loading-title" }, title));
  loading.appendChild(el("div", { class: "dam-loading-sub" }, sub));

  if (steps && steps.length > 0) {
    const stepsEl = el("div", { class: "dam-loading-steps" });
    steps.forEach((s, i) => {
      const step = el("div", { class: "dam-loading-step", "data-done": String(i < 0) });
      step.appendChild(el("span", { class: "dam-loading-step-dot" }));
      step.appendChild(document.createTextNode(s));
      stepsEl.appendChild(step);
    });
    loading.appendChild(stepsEl);
  }

  body.appendChild(loading);
  modal.appendChild(body);
  document.body.appendChild(modal);

  return modal;
}

function updateLoading(
  modal: HTMLElement,
  opts: { title?: string; sub?: string; stepDone?: number }
) {
  if (opts.title) {
    const t = $(".dam-loading-title", modal);
    if (t) t.textContent = opts.title;
  }
  if (opts.sub) {
    const s = $(".dam-loading-sub", modal);
    if (s) s.textContent = opts.sub;
  }
  if (opts.stepDone !== undefined) {
    const steps = modal.querySelectorAll(".dam-loading-step");
    steps.forEach((step, i) => {
      if (i <= opts.stepDone!) step.setAttribute("data-done", "true");
    });
  }
}

// ─── Question Modal ───────────────────────────────────────────────────
function showQuestion(
  q: { id: string; question: string; type: string; options?: Array<{ id: string; label: string; allowsText?: boolean }>; skippable: boolean },
  index: number,
  total: number,
  onBack?: () => void
): Promise<{ questionId: string; question: string; selected: string[]; otherText?: string | null; skipped?: boolean }> {
  return new Promise((resolve) => {
    closeAll();

    const backdrop = el("div", { class: "dam-backdrop" });
    backdrop.addEventListener("click", () => {
      closeAll();
      flowActive = false;
      resolve({ questionId: q.id, question: q.question, selected: [], skipped: true });
    });
    document.body.appendChild(backdrop);

    const modal = el("div", { class: "dam-modal" });

    // Header
    const header = el("div", { class: "dam-modal-header" });
    const titleWrap = el("span", { class: "dam-modal-title" });
    titleWrap.appendChild(el("span", { class: "dam-modal-title-icon" }, "\u2728"));
    titleWrap.appendChild(document.createTextNode("DAM AI"));
    header.appendChild(titleWrap);
    header.appendChild(el("span", { class: "dam-progress" }, `${index + 1} of ${total}`));
    const closeBtn = el("button", { class: "dam-modal-close" }, "\u00d7");
    closeBtn.addEventListener("click", () => {
      closeAll();
      flowActive = false;
      resolve({ questionId: q.id, question: q.question, selected: [], skipped: true });
    });
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Body
    const body = el("div", { class: "dam-modal-body" });
    body.appendChild(el("div", { class: "dam-question-text" }, q.question));

    const selected = new Set<string>();
    let showOther = false;

    function submitAnswer(otherText?: string | null) {
      closeAll();
      flowActive = false;
      resolve({
        questionId: q.id,
        question: q.question,
        selected: Array.from(selected),
        otherText: otherText ?? null,
        skipped: false,
      });
    }

    function renderOptions() {
      body.querySelectorAll(".dam-option, .dam-other-input").forEach((e) => e.remove());

      if (q.type !== "text" && q.options) {
        q.options.forEach((o) => {
          const isSel = selected.has(o.label) || (o.id === "other" && showOther);
          const btn = el("button", {
            class: "dam-option",
            "data-selected": String(isSel),
          }, o.label);
          btn.addEventListener("click", () => {
            if (o.id === "other") {
              showOther = true;
              renderOptions();
              setTimeout(() => {
                const inp = body.querySelector(".dam-other-input") as HTMLInputElement | null;
                inp?.focus();
              }, 30);
              return;
            }
            if (q.type === "single") {
              selected.clear();
              selected.add(o.label);
              // Auto-advance for single-select
              setTimeout(() => submitAnswer(), 120);
            } else {
              if (selected.has(o.label)) selected.delete(o.label);
              else selected.add(o.label);
              renderOptions();
            }
          });
          body.appendChild(btn);
        });
      }

      if (q.type === "text") {
        const inp = el("input", {
          class: "dam-other-input",
          placeholder: "Type your answer\u2026",
        }) as HTMLInputElement;
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitAnswer(inp.value.trim() || null);
          }
        });
        body.appendChild(inp);
        setTimeout(() => inp.focus(), 30);
      }

      if (showOther && q.type !== "text") {
        const inp = el("input", {
          class: "dam-other-input",
          placeholder: "Type your answer\u2026",
        }) as HTMLInputElement;
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitAnswer(inp.value.trim() || null);
          }
        });
        body.appendChild(inp);
        setTimeout(() => inp.focus(), 30);
      }
    }

    renderOptions();
    modal.appendChild(body);

    // Footer
    const footer = el("div", { class: "dam-modal-footer" });
    const left = el("div", { class: "dam-modal-footer-left" });
    const right = el("div", { class: "dam-modal-footer-right" });

    if (onBack) {
      const backBtn = el("button", { class: "dam-btn" }, "Back");
      backBtn.addEventListener("click", () => {
        onBack();
        resolve({ questionId: q.id, question: q.question, selected: [], skipped: true });
      });
      left.appendChild(backBtn);
    }

    if (q.skippable) {
      const skipBtn = el("button", { class: "dam-btn dam-btn-skip" }, "Skip");
      skipBtn.addEventListener("click", () => {
        closeAll();
        flowActive = false;
        resolve({ questionId: q.id, question: q.question, selected: [], skipped: true });
      });
      left.appendChild(skipBtn);
    }

    // Submit button for multi-select and text
    if (q.type === "multi" || q.type === "text") {
      const submitBtn = el("button", { class: "dam-btn dam-btn-primary" }, "Submit");
      submitBtn.addEventListener("click", () => {
        const otherInp = body.querySelector(".dam-other-input") as HTMLInputElement | null;
        submitAnswer(showOther && otherInp?.value.trim() ? otherInp.value.trim() : null);
      });
      right.appendChild(submitBtn);
    }

    footer.appendChild(left);
    footer.appendChild(right);
    modal.appendChild(footer);

    document.body.appendChild(modal);
  });
}

// ─── Flow ─────────────────────────────────────────────────────────────
async function runDamFlow(adapter: HostAdapter) {
  if (flowActive) return;
  flowActive = true;

  const [apiKey, provider] = await Promise.all([getApiKey(), getProvider()]);

  if (!apiKey) {
    closeAll();
    const backdrop = el("div", { class: "dam-backdrop" });
    backdrop.addEventListener("click", closeAll);
    document.body.appendChild(backdrop);

    const modal = el("div", { class: "dam-modal" });
    modal.style.width = "380px";
    const header = el("div", { class: "dam-modal-header" });
    const titleWrap = el("span", { class: "dam-modal-title" });
    titleWrap.appendChild(el("span", { class: "dam-modal-title-icon" }, "\u2728"));
    titleWrap.appendChild(document.createTextNode("DAM AI"));
    header.appendChild(titleWrap);
    const closeBtn = el("button", { class: "dam-modal-close" }, "\u00d7");
    closeBtn.addEventListener("click", closeAll);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const body = el("div", { class: "dam-modal-body" });
    body.style.textAlign = "center";
    body.style.padding = "32px 24px";
    body.appendChild(el("div", { class: "dam-loading-title" }, "No API key configured"));
    body.appendChild(el("div", { class: "dam-loading-sub" },
      `Set your ${provider === "groq" ? "Groq" : "Gemini"} API key in Settings to use DAM AI.`));
    modal.appendChild(body);

    const footer = el("div", { class: "dam-modal-footer" });
    const left = el("div", { class: "dam-modal-footer-left" });
    const right = el("div", { class: "dam-modal-footer-right" });

    const cancelBtn = el("button", { class: "dam-btn" }, "Cancel");
    cancelBtn.addEventListener("click", closeAll);
    const settingsBtn = el("button", { class: "dam-btn dam-btn-primary" }, "Open Settings");
    settingsBtn.addEventListener("click", () => { closeAll(); openSettings(); });

    left.appendChild(cancelBtn);
    right.appendChild(settingsBtn);
    footer.appendChild(left);
    footer.appendChild(right);
    modal.appendChild(footer);
    document.body.appendChild(modal);
    flowActive = false;
    return;
  }

  const model = await getModel();

  // Step 1: Analyzing
  const loadingModal = showLoading(
    "Understanding your request",
    "Analyzing your prompt to find what needs clarification",
    [
      "Reading your prompt",
      "Identifying ambiguities",
      "Generating questions",
    ]
  );

  try {
    // Small delay so the loading UI renders
    await new Promise((r) => setTimeout(r, 300));
    updateLoading(loadingModal, { stepDone: 0 });

    const clarifyRes = await chrome.runtime.sendMessage({
      type: "clarify",
      provider,
      apiKey,
      model,
      prompt: adapter.readPrompt().trim(),
    });

    updateLoading(loadingModal, { stepDone: 2 });

    if (clarifyRes.error) throw new Error(clarifyRes.error);

    const questions = clarifyRes.questions || [];

    if (questions.length === 0) {
      // No questions needed — enhance directly
      updateLoading(loadingModal, {
        title: "No clarifications needed",
        sub: "Your prompt is already clear. Building the enhanced version\u2026",
      });
      await new Promise((r) => setTimeout(r, 400));

      const enhanceRes = await chrome.runtime.sendMessage({
        type: "enhance",
        provider, apiKey, model,
        originalPrompt: adapter.readPrompt().trim(),
        answers: [],
      });

      closeAll();
      if (enhanceRes.error) throw new Error(enhanceRes.error);

      adapter.writePrompt(enhanceRes.enhancedPrompt);
      adapter.focusComposer();
      flowActive = false;
      showToast("DAM AI enhanced your prompt. Review it, then send.");
      return;
    }

    // Step 2: Ask questions
    await new Promise((r) => setTimeout(r, 200));
    closeAll();

    const allAnswers: Array<{ questionId: string; question: string; selected: string[]; otherText?: string | null; skipped?: boolean }> = [];

    // Question loop with back navigation
    let qi = 0;
    while (qi < questions.length) {
      let wentBack = false;
      const result = await showQuestion(
        questions[qi],
        qi,
        questions.length,
        qi > 0 ? () => { wentBack = true; } : undefined
      );
      if (wentBack) {
        qi--;
      } else {
        allAnswers[qi] = result;
        qi++;
      }
    }

    // Step 3: Enhancing
    flowActive = true;
    const enhanceModal = showLoading(
      "Building your prompt",
      "Combining your answers into a detailed, structured prompt",
      [
        "Processing your answers",
        "Structuring the enhanced prompt",
        "Finalizing output",
      ]
    );

    await new Promise((r) => setTimeout(r, 200));
    updateLoading(enhanceModal, { stepDone: 0 });

    console.log("[DAM AI] Enhancing with answers:", allAnswers);
    const enhanceRes = await chrome.runtime.sendMessage({
      type: "enhance",
      provider, apiKey, model,
      originalPrompt: adapter.readPrompt().trim(),
      answers: allAnswers.filter(Boolean),
    });
    console.log("[DAM AI] Enhance response:", enhanceRes);

    updateLoading(enhanceModal, { stepDone: 2 });
    await new Promise((r) => setTimeout(r, 300));

    closeAll();
    if (!enhanceRes || enhanceRes.error) throw new Error(enhanceRes?.error || "No response from enhance");

    const promptText = enhanceRes.enhancedPrompt;
    if (!promptText) throw new Error("Enhanced prompt was empty");

    console.log("[DAM AI] Writing prompt, length:", promptText.length);
    adapter.writePrompt(promptText);
    adapter.focusComposer();
    flowActive = false;
    showToast("DAM AI enhanced your prompt. Review it, then send.");

  } catch (err) {
    closeAll();
    flowActive = false;

    const backdrop = el("div", { class: "dam-backdrop" });
    backdrop.addEventListener("click", closeAll);
    document.body.appendChild(backdrop);

    const modal = el("div", { class: "dam-modal" });
    modal.style.width = "380px";
    const header = el("div", { class: "dam-modal-header" });
    const titleWrap = el("span", { class: "dam-modal-title" });
    titleWrap.appendChild(el("span", { class: "dam-modal-title-icon" }, "\u2728"));
    titleWrap.appendChild(document.createTextNode("DAM AI"));
    header.appendChild(titleWrap);
    const closeBtn = el("button", { class: "dam-modal-close" }, "\u00d7");
    closeBtn.addEventListener("click", closeAll);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const body = el("div", { class: "dam-modal-body" });
    body.style.textAlign = "center";
    body.style.padding = "32px 24px";
    body.appendChild(el("div", { class: "dam-loading-title" }, "Something went wrong"));
    body.appendChild(el("div", { class: "dam-loading-sub" },
      err instanceof Error ? err.message : "Unknown error"));
    modal.appendChild(body);

    const footer = el("div", { class: "dam-modal-footer" });
    const left = el("div", { class: "dam-modal-footer-left" });
    const right = el("div", { class: "dam-modal-footer-right" });

    const cancelBtn = el("button", { class: "dam-btn" }, "Use original prompt");
    cancelBtn.addEventListener("click", closeAll);
    const retryBtn = el("button", { class: "dam-btn dam-btn-primary" }, "Try again");
    retryBtn.addEventListener("click", () => { closeAll(); runDamFlow(adapter); });

    left.appendChild(cancelBtn);
    right.appendChild(retryBtn);
    footer.appendChild(left);
    footer.appendChild(right);
    modal.appendChild(footer);
    document.body.appendChild(modal);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────
async function init() {
  injectStyles();
  await initDefaults();
  const adapter = getAdapter();
  if (!adapter) return;

  console.log("[DAM AI] Content script loaded on", location.hostname);

  currentEnabled = await getDamEnabled();

  function ensureMounted() {
    if (!adapter) return;
    if ($(".dam-toggle")) return;
    renderToggle();
  }

  ensureMounted();
  let debounce: ReturnType<typeof setTimeout>;
  new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(ensureMounted, 300);
  }).observe(document.body, { childList: true, subtree: true });

  // Enter interception
  document.addEventListener("keydown", (e) => {
    if (!currentEnabled || flowActive) return;
    if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
    if (!adapter?.isComposer(e.target)) return;
    const prompt = adapter.readPrompt().trim();
    if (!prompt) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log("[DAM AI] Enter intercepted");
    runDamFlow(adapter);
  }, true);

  // Send button interception
  document.addEventListener("click", (e) => {
    if (!currentEnabled || flowActive) return;
    if (!adapter?.isSendButton(e.target)) return;
    const prompt = adapter.readPrompt().trim();
    if (!prompt) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log("[DAM AI] Send intercepted");
    runDamFlow(adapter);
  }, true);

  console.log("[DAM AI] Interception initialized");
}

init();
