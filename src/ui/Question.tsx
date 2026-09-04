import { useState, useRef, useEffect } from "react";
import type { DamQuestion as DamQuestionType, DamOption } from "../types/dam";

interface QuestionProps {
  question: DamQuestionType;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: string, selected: string[], otherText?: string) => void;
  onSkip: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function Question({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onSkip,
  onBack,
  onCancel,
}: QuestionProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherText, setOtherText] = useState("");
  const [showOther, setShowOther] = useState(false);
  const otherInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showOther && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [showOther]);

  const handleOptionClick = (option: DamOption) => {
    if (option.id === "other") {
      setShowOther(true);
      return;
    }

    if (question.type === "single") {
      onAnswer(question.id, [option.label]);
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(option.label)) {
          next.delete(option.label);
        } else {
          next.add(option.label);
        }
        return next;
      });
    }
  };

  const handleContinue = () => {
    if (showOther && otherText.trim()) {
      onAnswer(question.id, Array.from(selected), otherText.trim());
    } else {
      onAnswer(question.id, Array.from(selected));
    }
  };

  const handleOtherConfirm = () => {
    if (otherText.trim()) {
      onAnswer(question.id, [], otherText.trim());
    }
  };

  return (
    <div data-dam-ai-card>
      <div data-dam-ai-card-header>
        <span data-dam-ai-card-title>DAM AI</span>
        <span data-dam-ai-card-progress>
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>
      <div data-dam-ai-card-body>
        <div data-dam-ai-question-text>{question.question}</div>
        {question.options?.map((option) => (
          <button
            key={option.id}
            data-dam-ai-option
            aria-selected={
              option.id === "other"
                ? showOther
                : selected.has(option.label)
            }
            onClick={() => handleOptionClick(option)}
          >
            {option.label}
            {option.allowsText && showOther ? "..." : ""}
          </button>
        ))}
        {showOther && (
          <div style={{ marginTop: 8 }}>
            <input
              ref={otherInputRef}
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleOtherConfirm();
                }
              }}
              placeholder="Type your answer..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--dam-border)",
                borderRadius: 6,
                background: "var(--dam-surface)",
                color: "var(--dam-text)",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>
      <div data-dam-ai-card-footer>
        <div style={{ display: "flex", gap: 8 }}>
          {currentIndex > 0 && (
            <button data-dam-ai-btn onClick={onBack}>
              Back
            </button>
          )}
          <button data-dam-ai-btn onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {question.skippable && (
            <button data-dam-ai-btn onClick={onSkip}>
              Skip
            </button>
          )}
          {question.type === "multi" && (
            <button data-dam-ai-btn data-dam-ai-btn-primary onClick={handleContinue}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
