import { useState, useCallback, useEffect } from "react";
import type { DamAnswer, DamSession } from "../types/dam";
import { fetchClarifications, fetchEnhancedPrompt, getApiKey, getProvider } from "../api/damApi";
import type { HostAdapter } from "../content/hostAdapter";
import { Question } from "./Question";
import { Loader } from "./Loader";
import { Toast } from "./Toast";

interface ClarifierProps {
  host: "chatgpt" | "claude";
  adapter: HostAdapter;
  onCancel: () => void;
}

export function Clarifier({ host, adapter, onCancel }: ClarifierProps) {
  const [session, setSession] = useState<DamSession>(() => ({
    originalPrompt: adapter.readPrompt(),
    questions: [],
    answers: {},
    currentIndex: 0,
    state: "analyzing",
    sessionId: crypto.randomUUID(),
  }));
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    Promise.all([getApiKey(), getProvider()]).then(([key, provider]) => {
      if (!key) {
        setNeedsApiKey(true);
        const name = provider === "groq" ? "Groq" : "Gemini";
        setError(`Set your ${name} API key in settings first.`);
        setSession((prev) => ({ ...prev, state: "error" }));
      }
    });
  }, []);

  const loadClarifications = useCallback(async () => {
    try {
      const response = await fetchClarifications(session.originalPrompt, host);
      setSession((prev) => ({
        ...prev,
        questions: response.questions,
        state: response.questions.length === 0 ? "enhancing" : "questioning",
      }));

      if (response.questions.length === 0) {
        await enhance([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "DAM AI couldn't analyze this prompt.");
      setSession((prev) => ({ ...prev, state: "error" }));
    }
  }, [session.originalPrompt, host]);

  const enhance = useCallback(
    async (answers: DamAnswer[]) => {
      setSession((prev) => ({ ...prev, state: "enhancing" }));
      try {
        const response = await fetchEnhancedPrompt(session.originalPrompt, answers);
        adapter.writePrompt(response.enhancedPrompt);
        adapter.focusComposer();
        setSession((prev) => ({ ...prev, state: "completed" }));
        setToast("DAM AI enhanced your prompt. Review it, then send.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enhance prompt.");
        setSession((prev) => ({ ...prev, state: "error" }));
      }
    },
    [session.originalPrompt, adapter]
  );

  useEffect(() => {
    if (session.state === "analyzing") {
      loadClarifications();
    }
  }, [session.state, loadClarifications]);

  const handleAnswer = (questionId: string, selected: string[], otherText?: string) => {
    const question = session.questions[session.currentIndex];
    const answer: DamAnswer = {
      questionId,
      question: question.question,
      selected,
      otherText: otherText ?? null,
    };

    const newAnswers = { ...session.answers, [questionId]: answer };
    const nextIndex = session.currentIndex + 1;

    setSession((prev) => ({
      ...prev,
      answers: newAnswers,
      currentIndex: nextIndex,
    }));

    if (nextIndex >= session.questions.length) {
      enhance(Object.values(newAnswers));
    }
  };

  const handleSkip = () => {
    const question = session.questions[session.currentIndex];
    const answer: DamAnswer = {
      questionId: question.id,
      question: question.question,
      selected: [],
      skipped: true,
    };

    const newAnswers = { ...session.answers, [question.id]: answer };
    const nextIndex = session.currentIndex + 1;

    setSession((prev) => ({
      ...prev,
      answers: newAnswers,
      currentIndex: nextIndex,
    }));

    if (nextIndex >= session.questions.length) {
      enhance(Object.values(newAnswers));
    }
  };

  const handleBack = () => {
    setSession((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  };

  if (toast) {
    return (
      <Toast
        message={toast}
        onClose={() => {
          setToast(null);
          onCancel();
        }}
      />
    );
  }

  if (session.state === "analyzing") {
    return <Loader text="Understanding your request..." />;
  }

  if (session.state === "enhancing") {
    return <Loader text="Building your prompt..." />;
  }

  if (session.state === "completed") {
    return null;
  }

  if (session.state === "error" && error) {
    return (
      <div data-dam-ai-card>
        <div data-dam-ai-card-header>
          <span data-dam-ai-card-title>DAM AI</span>
        </div>
        <div data-dam-ai-card-body>
          <p style={{ marginBottom: 12 }}>{error}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {needsApiKey ? (
              <button data-dam-ai-btn onClick={onCancel}>Close</button>
            ) : (
              <>
                <button
                  data-dam-ai-btn
                  data-dam-ai-btn-primary
                  onClick={() => {
                    setError(null);
                    setSession((prev) => ({ ...prev, state: "analyzing" }));
                  }}
                >
                  Try again
                </button>
                <button data-dam-ai-btn onClick={onCancel}>Use original prompt</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (session.state === "questioning" && session.questions.length > 0) {
    const question = session.questions[session.currentIndex];
    if (question) {
      return (
        <Question
          question={question}
          currentIndex={session.currentIndex}
          totalQuestions={session.questions.length}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onBack={handleBack}
          onCancel={onCancel}
        />
      );
    }
  }

  return null;
}
