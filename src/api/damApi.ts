import type { ClarifyResponse, DamAnswer } from "../types/dam";

function sendMessage(message: Record<string, unknown>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response?.error) {
        reject(new Error(response.error));
        return;
      }
      resolve(response);
    });
  });
}

export async function getApiKey(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("dam-ai-api-key", (result) => {
      resolve(result["dam-ai-api-key"] ?? "");
    });
  });
}

export async function setApiKey(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ "dam-ai-api-key": key }, resolve);
  });
}

export async function getModel(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("dam-ai-model", (result) => {
      resolve(result["dam-ai-model"] ?? "");
    });
  });
}

export async function setModel(model: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ "dam-ai-model": model }, resolve);
  });
}

export async function getProvider(): Promise<"gemini" | "groq"> {
  return new Promise((resolve) => {
    chrome.storage.local.get("dam-ai-provider", (result) => {
      resolve(result["dam-ai-provider"] ?? "groq");
    });
  });
}

export async function setProvider(provider: "gemini" | "groq"): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ "dam-ai-provider": provider }, resolve);
  });
}

export async function fetchClarifications(
  prompt: string,
  _host: "chatgpt" | "claude"
): Promise<ClarifyResponse> {
  const provider = await getProvider();
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("API key not set");

  const model = await getModel();
  return sendMessage({
    type: "clarify",
    provider,
    apiKey,
    model,
    prompt,
  }) as Promise<ClarifyResponse>;
}

export async function fetchEnhancedPrompt(
  originalPrompt: string,
  answers: DamAnswer[]
): Promise<{ enhancedPrompt: string }> {
  const provider = await getProvider();
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("API key not set");

  const model = await getModel();
  return sendMessage({
    type: "enhance",
    provider,
    apiKey,
    model,
    originalPrompt,
    answers,
  }) as Promise<{ enhancedPrompt: string }>;
}
