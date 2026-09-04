import { useState, useEffect } from "react";
import { getApiKey, setApiKey, getModel, setModel, getProvider, setProvider } from "../api/damApi";

const GEMINI_MODELS = [
  { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

const GROQ_MODELS = [
  { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B (Fast)" },
  { value: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B" },
  { value: "qwen/qwen3.8-27b", label: "Qwen 3.8 27B" },
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B (Best)" },
];

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [provider, setProviderState] = useState<"gemini" | "groq">("groq");
  const [apiKey, setApiKeyState] = useState("");
  const [model, setModelState] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProvider().then((p) => {
      setProviderState(p);
      getApiKey().then(setApiKeyState);
      getModel().then((m) => {
        if (!m) {
          setModelState(p === "groq" ? "openai/gpt-oss-20b" : "gemini-3.6-flash");
        } else {
          setModelState(m);
        }
      });
    });
  }, []);

  const models = provider === "groq" ? GROQ_MODELS : GEMINI_MODELS;

  const handleProviderChange = (newProvider: "gemini" | "groq") => {
    setProviderState(newProvider);
    setModelState(newProvider === "groq" ? "openai/gpt-oss-20b" : "gemini-3.6-flash");
    setApiKeyState("");
  };

  const handleSave = async () => {
    setSaving(true);
    await setProvider(provider);
    await setApiKey(apiKey);
    await setModel(model);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-dam-ai-card style={{ position: "relative", width: 400 }}>
      <div data-dam-ai-card-header>
        <span data-dam-ai-card-title>DAM AI Settings</span>
      </div>
      <div data-dam-ai-card-body>
        <label style={{ display: "block", fontSize: 13, color: "var(--dam-muted)", marginBottom: 4 }}>
          Provider
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            data-dam-ai-btn
            data-dam-ai-btn-primary={provider === "groq"}
            onClick={() => handleProviderChange("groq")}
            style={{ flex: 1 }}
          >
            Groq (Free)
          </button>
          <button
            data-dam-ai-btn
            data-dam-ai-btn-primary={provider === "gemini"}
            onClick={() => handleProviderChange("gemini")}
            style={{ flex: 1 }}
          >
            Gemini
          </button>
        </div>

        <label style={{ display: "block", fontSize: 13, color: "var(--dam-muted)", marginBottom: 4 }}>
          {provider === "groq" ? "Groq API Key" : "Gemini API Key"}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyState(e.target.value)}
          placeholder={provider === "groq" ? "gsk_..." : "AIza..."}
          style={{
            width: "100%", padding: "8px 12px",
            border: "1px solid var(--dam-border)", borderRadius: 6,
            background: "var(--dam-surface)", color: "var(--dam-text)",
            fontSize: 14, marginBottom: 12, boxSizing: "border-box",
          }}
        />

        <label style={{ display: "block", fontSize: 13, color: "var(--dam-muted)", marginBottom: 4 }}>
          Model
        </label>
        <select
          value={model}
          onChange={(e) => setModelState(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px",
            border: "1px solid var(--dam-border)", borderRadius: 6,
            background: "var(--dam-surface)", color: "var(--dam-text)",
            fontSize: 14, boxSizing: "border-box",
          }}
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {provider === "groq" && (
          <p style={{ fontSize: 11, color: "var(--dam-muted)", marginTop: 8 }}>
            Free tier: 30 req/min, no credit card needed. Get a key at{" "}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "var(--dam-primary)" }}>
              console.groq.com
            </a>
          </p>
        )}
      </div>
      <div data-dam-ai-card-footer>
        <button data-dam-ai-btn onClick={onClose}>Close</button>
        <button data-dam-ai-btn data-dam-ai-btn-primary onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
