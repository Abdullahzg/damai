import type { HostAdapter } from "../hostAdapter";

export class ClaudeAdapter implements HostAdapter {
  id = "claude" as const;

  isSupported(): boolean {
    return location.hostname === "claude.ai";
  }

  findComposer(): HTMLElement | null {
    const selectors = [
      '[data-testid="chat-input"]',
      '[data-testid="composer"]',
      '[contenteditable="true"][role="textbox"]',
      '.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"][class*="composer"]',
      'div[contenteditable="true"][placeholder]',
      'form [contenteditable="true"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el && el.offsetParent !== null) {
        console.log("[DAM AI] Found Claude composer:", sel);
        return el;
      }
    }

    // Fallback: any visible contenteditable
    const editables = document.querySelectorAll('div[contenteditable="true"]');
    for (const el of editables) {
      if (el instanceof HTMLElement && el.offsetParent !== null && el.getBoundingClientRect().height > 20) {
        console.log("[DAM AI] Found Claude composer via fallback");
        return el;
      }
    }

    console.log("[DAM AI] No Claude composer found");
    return null;
  }

  findToolbar(): HTMLElement | null {
    const composer = this.findComposer();
    if (!composer) return null;

    // Claude's bottom action bar has the +, Chat, Cowork buttons
    // Walk up from composer and look for a sibling or child bar with buttons
    let container: HTMLElement | null = null;
    let el: HTMLElement | null = composer;
    for (let i = 0; i < 10; i++) {
      el = el.parentElement;
      if (!el) break;
      // Check if this element has button children that look like a toolbar
      const buttons = el.querySelectorAll("button");
      const hasChat = Array.from(buttons).some((b) => b.textContent?.trim() === "Chat");
      const hasCowork = Array.from(buttons).some((b) => b.textContent?.trim() === "Cowork");
      if (hasChat || hasCowork) {
        container = el;
        break;
      }
    }

    if (container) {
      // The toolbar is the last child div of this container (the bottom bar)
      const children = container.querySelectorAll(":scope > div");
      for (const child of children) {
        if (child instanceof HTMLElement && child.querySelector("button")) {
          console.log("[DAM AI] Found Claude toolbar:", child.tagName);
          return child;
        }
      }
      console.log("[DAM AI] Found Claude toolbar (container)");
      return container;
    }

    // Fallback: closest form/fieldset
    const form = composer.closest("form") || composer.closest("fieldset");
    if (form) {
      console.log("[DAM AI] Found Claude toolbar via closest form/fieldset");
      return form as HTMLElement;
    }

    console.log("[DAM AI] No Claude toolbar found");
    return null;
  }

  findSendButton(): HTMLElement | null {
    const selectors = [
      'button[aria-label="Send Message"]',
      'button[aria-label="Send"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      '[data-testid="send-button"]',
      'button[aria-label*="submit"]',
      'button[aria-label*="Submit"]',
      'button svg[data-testid="send-icon"]',
      'form button:last-of-type',
    ];

    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el && !(el as HTMLButtonElement).disabled) return el;
      } catch {}
    }

    // Walk from composer up to find any button with SVG (send icons are usually SVGs)
    const composer = this.findComposer();
    if (composer) {
      let el: HTMLElement | null = composer;
      for (let i = 0; i < 8; i++) {
        el = el.parentElement;
        if (!el) break;
        const btns = el.querySelectorAll("button:not([disabled])");
        for (const btn of btns) {
          if (btn.querySelector("svg") && btn.getBoundingClientRect().right > window.innerWidth / 2) {
            return btn as HTMLElement;
          }
        }
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

    // ProseMirror contenteditable
    composer.focus();

    // Select all and delete first
    document.execCommand("selectAll", false, undefined);
    document.execCommand("delete", false, undefined);

    // Insert new text
    document.execCommand("insertText", false, text);

    // Fire events to sync with React state
    composer.dispatchEvent(new Event("input", { bubbles: true }));
    composer.dispatchEvent(new Event("change", { bubbles: true }));
  }

  focusComposer(): void {
    const composer = this.findComposer();
    if (composer) {
      composer.focus();
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
      target.matches('button[aria-label="Send Message"]') ||
      target.matches('button[aria-label="Send"]') ||
      target.closest('button[aria-label="Send Message"]') !== null ||
      target.closest('button[aria-label="Send"]') !== null ||
      target.matches('[data-testid="send-button"]') ||
      target.closest('[data-testid="send-button"]') !== null
    );
  }

  isComposer(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    return (
      target.matches('[data-testid="chat-input"]') ||
      target.matches('[data-testid="composer"]') ||
      target.matches('[contenteditable="true"][role="textbox"]') ||
      target.matches('.ProseMirror[contenteditable="true"]') ||
      target.closest('[data-testid="chat-input"]') !== null ||
      target.closest('[data-testid="composer"]') !== null ||
      target.closest('.ProseMirror[contenteditable="true"]') !== null
    );
  }
}
