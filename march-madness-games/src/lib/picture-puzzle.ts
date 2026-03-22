import gameData from "@/data/picture-puzzle.json";

export interface PicturePuzzleClue {
  emoji: string;
  bgColor: string;
  text: string;
}

export interface PicturePuzzleRound {
  id: number;
  clues: PicturePuzzleClue[];
  answer: string;
  acceptableAnswers: string[];
  description: string;
}

export interface PicturePuzzleGame {
  id: string;
  title: string;
  description: string;
  rounds: PicturePuzzleRound[];
}

export function getPicturePuzzleGame(): PicturePuzzleGame {
  return gameData as PicturePuzzleGame;
}
