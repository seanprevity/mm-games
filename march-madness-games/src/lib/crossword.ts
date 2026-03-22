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
  rows: number;
  cols: number;
  cells: string[][];
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
}

export function getCrosswordGame(): CrosswordGame {
  const raw = gameData as Record<string, unknown>;
  const gridSize = raw.gridSize as number | { rows: number; cols: number };

  let rows: number;
  let cols: number;

  if (typeof gridSize === "number") {
    rows = gridSize;
    cols = gridSize;
  } else {
    rows = gridSize.rows;
    cols = gridSize.cols;
  }

  return { ...raw, rows, cols } as CrosswordGame;
}
