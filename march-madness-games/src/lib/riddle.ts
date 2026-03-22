import gameData from "@/data/riddle.json";

export type RiddleField = "team1" | "team2" | "event" | "year";

export interface RiddleRound {
  id: number;
  riddles: Record<RiddleField, string>;
  answers: Record<RiddleField, string>;
}

export interface RiddleGame {
  id: string;
  title: string;
  description: string;
  rounds: RiddleRound[];
}

export function getRiddleGame(): RiddleGame {
  return gameData as RiddleGame;
}
