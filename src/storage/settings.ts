const STORAGE_KEY = "dam-ai-enabled";

export async function initDefaults(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["dam-ai-api-key", "dam-ai-provider", "dam-ai-model"], (result) => {
      const updates: Record<string, string> = {};
      if (!result["dam-ai-api-key"]) updates["dam-ai-api-key"] = "";
      if (!result["dam-ai-provider"]) updates["dam-ai-provider"] = "groq";
      if (!result["dam-ai-model"]) updates["dam-ai-model"] = "openai/gpt-oss-20b";
      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates, resolve);
      } else {
        resolve();
      }
    });
  });
}

export async function getDamEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] ?? false);
    });
  });
}

export async function setDamEnabled(enabled: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: enabled }, resolve);
  });
}
