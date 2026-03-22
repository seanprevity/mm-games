import gameData from "@/data/connections.json";
import type { ConnectionsGame } from "@/types/types";

export interface ConnectionsTile {
  id: string;
  value: string;
  categoryName: string;
  difficulty: string;
}

export function getConnectionsGame(): ConnectionsGame {
  return gameData as ConnectionsGame;
}

export function getShuffledConnectionsTiles(): ConnectionsTile[] {
  const game = getConnectionsGame();

  const tiles = game.categories.flatMap((category) =>
    category.items.map((item) => ({
      id: `${category.name}-${item}`,
      value: item,
      categoryName: category.name,
      difficulty: category.difficulty,
    })),
  );

  return shuffleArray(tiles);
}

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
