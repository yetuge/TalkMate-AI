export type ScenarioId =
  | "job-interview"
  | "restaurant-ordering"
  | "business-meeting"
  | "travel";

export type ScenarioDifficulty = "Easy" | "Medium" | "Hard";

export type Scenario = {
  id: ScenarioId;
  title: string;
  description: string;
  difficulty: ScenarioDifficulty;
  openingQuestion: string;
  aiRole: string;
  goals: string[];
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ScoreBreakdown = {
  grammar: number;
  fluency: number;
  vocabulary: number;
  pronunciation: number;
};

export type CorrectionFeedbackType =
  | "CORRECTION"
  | "ENHANCEMENT"
  | "CONTEXT_VALID";

export type Correction = {
  feedbackType: CorrectionFeedbackType;
  originalText: string;
  recommendedExpression: string;
  reason: string;
  scores: ScoreBreakdown;
  original?: string;
  corrected?: string;
  betterExpression?: string;
};

export type PracticeReport = {
  overallScore: number;
  scores: ScoreBreakdown;
  commonMistakes: string[];
  suggestions: string[];
  practiceSentences: string[];
  speakingTasks: string[];
  summary: string;
};

export type PracticeSession = {
  id: string;
  userId?: string;
  scenario: ScenarioId;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  overallScore?: number;
  scores?: ScoreBreakdown;
  messages: ChatMessage[];
  corrections: Correction[];
  report?: PracticeReport;
  createdAt: string;
};
