export type QuestionType = "single" | "multi" | "text";

export interface DamOption {
  id: string;
  label: string;
  allowsText?: boolean;
}

export interface DamQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: DamOption[];
  skippable: boolean;
  helpText?: string;
  dependsOn?: {
    questionId: string;
    optionIds: string[];
  };
}

export interface ClarifyResponse {
  summary: string;
  questions: DamQuestion[];
}

export interface DamAnswer {
  questionId: string;
  question: string;
  selected: string[];
  otherText?: string | null;
  skipped?: boolean;
}

export type DamState =
  | "idle"
  | "analyzing"
  | "questioning"
  | "enhancing"
  | "completed"
  | "error";

export interface DamSession {
  originalPrompt: string;
  questions: DamQuestion[];
  answers: Record<string, DamAnswer>;
  currentIndex: number;
  state: DamState;
  sessionId: string;
}
