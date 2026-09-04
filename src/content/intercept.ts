import type { HostAdapter } from "./hostAdapter";

type DamState =
  | "idle"
  | "analyzing"
  | "questioning"
  | "enhancing"
  | "completed"
  | "error";

let damEnabled = false;
let damState: DamState = "idle";
let adapter: HostAdapter | null = null;
let onStartFlow: (() => void) | null = null;

export function initInterception(
  hostAdapter: HostAdapter,
  enabledGetter: () => boolean,
  startFlow: () => void
) {
  adapter = hostAdapter;
  onStartFlow = startFlow;

  const getEnabled = enabledGetter;

  document.addEventListener(
    "keydown",
    (event) => {
      if (!getEnabled()) return;
      if (damState !== "idle") return;
      if (event.key !== "Enter") return;
      if (event.shiftKey) return;
      if (event.isComposing) return;
      if (!adapter?.isComposer(event.target)) return;

      const prompt = adapter.readPrompt().trim();
      if (!prompt) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log("[DAM AI] Enter intercepted");
      startFlowHandler();
    },
    true
  );

  document.addEventListener(
    "click",
    (event) => {
      if (!getEnabled()) return;
      if (damState !== "idle") return;
      if (!adapter?.isSendButton(event.target)) return;

      const prompt = adapter.readPrompt().trim();
      if (!prompt) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log("[DAM AI] Send button intercepted");
      startFlowHandler();
    },
    true
  );

  console.log("[DAM AI] Interception initialized");
}

function startFlowHandler() {
  damState = "analyzing";
  onStartFlow?.();
}

export function setDamState(state: DamState) {
  damState = state;
}

export function getDamState(): DamState {
  return damState;
}

export function setDamEnabledState(enabled: boolean) {
  damEnabled = enabled;
}

export function getDamEnabledState(): boolean {
  return damEnabled;
}
