import { generateClarifications, enhancePrompt } from "./gemini";

interface MessageRequest {
  type: "clarify" | "enhance";
  provider: "gemini" | "groq";
  apiKey: string;
  model: string;
  prompt?: string;
  originalPrompt?: string;
  answers?: Array<{
    questionId: string;
    question: string;
    selected: string[];
    otherText?: string | null;
    skipped?: boolean;
  }>;
}

chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    if (request.type === "clarify") {
      handleClarify(request)
        .then(sendResponse)
        .catch((err) => sendResponse({ error: err.message }));
      return true;
    }

    if (request.type === "enhance") {
      handleEnhance(request)
        .then(sendResponse)
        .catch((err) => sendResponse({ error: err.message }));
      return true;
    }

    return false;
  }
);

async function handleClarify(request: MessageRequest) {
  if (!request.prompt) throw new Error("Missing prompt");
  if (!request.apiKey) throw new Error("Missing API key");

  return generateClarifications(
    request.provider,
    request.apiKey,
    request.model,
    request.prompt
  );
}

async function handleEnhance(request: MessageRequest) {
  if (!request.originalPrompt) throw new Error("Missing original prompt");
  if (!request.answers) throw new Error("Missing answers");
  if (!request.apiKey) throw new Error("Missing API key");

  const result = await enhancePrompt(
    request.provider,
    request.apiKey,
    request.model,
    request.originalPrompt,
    request.answers
  );

  return { enhancedPrompt: result };
}
