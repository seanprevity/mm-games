import miniGameData from "@/data/mini-crossword.json";
import gameData from "@/data/crossword.json";

export interface CrosswordClue {
  number: number;
  clue: string;
  row: number;
  col: number;
}

export interface CrosswordGame {
  id: string;
  title: string;
  description: string;
  gridSize: number;
  cells: string[][];
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
}

export function getMiniCrosswordGame(): CrosswordGame {
  return miniGameData as CrosswordGame;
}

export function getCrosswordGame(): CrosswordGame {
  return gameData as CrosswordGame;
}
