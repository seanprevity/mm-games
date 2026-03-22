import gameData from "@/data/fifteen.json";

export interface FifteenWordsHint {
  text: string;
  index: number;
}

export interface FifteenWordsWord {
  id: number;
  answer: string;
  category: string;
  hints: string[];
}

export interface FifteenWordsGame {
  id: string;
  title: string;
  description: string;
  totalHintBudget: number;
  words: FifteenWordsWord[];
}

export function getFifteenWordsGame(): FifteenWordsGame {
  return gameData as FifteenWordsGame;
}
