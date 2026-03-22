import gameData from "@/data/millionaire.json";

export type MillionaireAnswerKey = "A" | "B" | "C" | "D";

export interface MillionaireQuestion {
  id: number;
  question: string;
  answers: Record<MillionaireAnswerKey, string>;
  correctAnswer: MillionaireAnswerKey;
  prize: number;
  askTheCrowd: Record<MillionaireAnswerKey, number>;
  fiftyFifty: MillionaireAnswerKey[];
  phoneAFriend: MillionaireAnswerKey;
}

export interface MillionaireCategory {
  id: string;
  name: string;
  description: string;
  questions: MillionaireQuestion[];
}

export interface MillionaireRound {
  id: string;
  title: string;
  categories: MillionaireCategory[];
}

export interface MillionaireGame {
  id: string;
  title: string;
  description: string;
  rounds: MillionaireRound[];
}

export function getMillionaireGame(): MillionaireGame {
  return gameData as MillionaireGame;
}
