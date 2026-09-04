import type { HostAdapter } from "../hostAdapter";

export class ChatGPTAdapter implements HostAdapter {
  id = "chatgpt" as const;

  isSupported(): boolean {
    return location.hostname === "chatgpt.com";
  }

  findComposer(): HTMLElement | null {
    // ChatGPT uses ProseMirror contenteditable div with id prompt-textarea
    const selectors = [
      '#prompt-textarea.ProseMirror[contenteditable="true"]',
      '[contenteditable="true"]#prompt-textarea',
      '#prompt-textarea[contenteditable="true"]',
      '#prompt-textarea',
      'form[data-type="unified-composer"] [contenteditable="true"]',
      '[data-testid="composer"] [contenteditable="true"]',
      'main form [contenteditable="true"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el && el.offsetParent !== null) {
        console.log("[DAM AI] Found composer:", sel);
        return el;
      }
    }

    // Fallback: any visible contenteditable in main
    const editables = document.querySelectorAll('main div[contenteditable="true"]');
    for (const el of editables) {
      if (el instanceof HTMLElement && el.offsetParent !== null && el.getBoundingClientRect().height > 20) {
        console.log("[DAM AI] Found composer via fallback");
        return el;
      }
    }

    console.log("[DAM AI] No composer found");
    return null;
  }

  findToolbar(): HTMLElement | null {
    const composer = this.findComposer();
    if (!composer) return null;

    // ChatGPT's input bar is the rounded container with +, input, and action buttons
    // Walk up from composer to find the bar (has border-radius, contains buttons)
    let el: HTMLElement | null = composer;
    for (let i = 0; i < 10; i++) {
      el = el.parentElement;
      if (!el) break;
      const style = window.getComputedStyle(el);
      const br = parseInt(style.borderRadius || "0", 10);
      const buttons = el.querySelectorAll("button");
      if (br >= 12 && buttons.length >= 2 && el.getBoundingClientRect().height > 30 && el.getBoundingClientRect().height < 120) {
        console.log("[DAM AI] Found ChatGPT toolbar:", el.tagName, el.className.substring(0, 50));
        return el;
      }
    }

    // Fallback: form
    const form = composer.closest("form");
    if (form) {
      console.log("[DAM AI] Found ChatGPT toolbar via form");
      return form as HTMLElement;
    }

    console.log("[DAM AI] No ChatGPT toolbar found");
    return null;
  }

  findSendButton(): HTMLElement | null {
    const selectors = [
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label*="Send"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) return el;
    }

    // Fallback: find the last button in the form
    const form = this.findComposer()?.closest("form");
    if (form) {
      const buttons = form.querySelectorAll('button:not([disabled])');
      if (buttons.length > 0) {
        return buttons[buttons.length - 1] as HTMLElement;
      }
    }

    return null;
  }

  readPrompt(): string {
    const composer = this.findComposer();
    if (!composer) return "";

    if (composer instanceof HTMLTextAreaElement) {
      return composer.value;
    }

    return composer.innerText?.trim() ?? "";
  }

  writePrompt(text: string): void {
    const composer = this.findComposer();
    if (!composer) return;

    if (composer instanceof HTMLTextAreaElement) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(composer, text);
      } else {
        composer.value = text;
      }
      composer.dispatchEvent(new Event("input", { bubbles: true }));
      composer.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    // contenteditable div (ProseMirror / ChatGPT)
    composer.focus();
    // Select all existing content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(composer);
    selection?.removeAllRanges();
    selection?.addRange(range);
    // Delete and insert new text
    document.execCommand("insertText", false, text);
  }

  focusComposer(): void {
    const composer = this.findComposer();
    if (composer) {
      composer.focus();
      // Move cursor to end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(composer);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  isSendButton(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    return (
      target.matches('button[data-testid="send-button"]') ||
      target.closest('button[data-testid="send-button"]') !== null ||
      target.matches('button[aria-label*="Send"]') ||
      target.closest('button[aria-label*="Send"]') !== null
    );
  }

  isComposer(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    return (
      target.matches('#prompt-textarea') ||
      target.matches('#prompt-textarea.ProseMirror') ||
      target.matches('[contenteditable="true"]#prompt-textarea') ||
      target.matches('[data-testid="composer"]') ||
      target.closest('#prompt-textarea') !== null ||
      target.closest('[data-testid="composer"]') !== null
    );
  }
}
