export interface HostAdapter {
  id: "chatgpt" | "claude";

  isSupported(): boolean;

  findComposer(): HTMLElement | null;

  findToolbar(): HTMLElement | null;

  findSendButton(): HTMLElement | null;

  readPrompt(): string;

  writePrompt(text: string): void;

  focusComposer(): void;

  isSendButton(target: EventTarget | null): boolean;

  isComposer(target: EventTarget | null): boolean;
}
