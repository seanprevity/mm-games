export interface ConnectionsCategory {
  name: string;
  difficulty: string;
  items: string[];
}

export interface ConnectionsGame {
  id: string;
  title: string;
  description: string;
  mistakesAllowed: number;
  categories: ConnectionsCategory[];
}

export interface CrosswordClue {
  number: number;
  row: number;
  col: number;
  answer: string;
  clue: string;
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

export interface PlayerCareerStop {
  team: string;
  years: string;
  logo?: string;
  type: "college" | "draft" | "nba";
  note?: string;
}

export interface PlayerGuessGameEntry {
  id: string;
  playerName: string;
  title: string;
  description: string;
  hint: string;
  careerPath: PlayerCareerStop[];
}

export interface PlayerGuessGameData {
  id: string;
  title: string;
  description: string;
  maxGuesses: number;
  players: PlayerGuessGameEntry[];
}
