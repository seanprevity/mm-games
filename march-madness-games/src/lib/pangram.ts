import gameData from "@/data/pangram.json";

export interface PangramWord {
  word: string;
  points: number;
  isPangram: boolean;
}

export interface PangramGame {
  id: string;
  title: string;
  description: string;
  centerLetter: string;
  outerLetters: string[];
  words: PangramWord[];
}

export function getPangramGame(): PangramGame {
  return gameData as PangramGame;
}
