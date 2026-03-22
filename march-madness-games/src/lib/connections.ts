import gameData from "@/data/connections.json";

export type ConnectionsTile = {
  id: string;
  value: string;
  categoryName: string;
  difficulty: string;
};

export interface ConnectionsCategory {
  name: string;
  difficulty: string;
  items: string[];
  revealed: string[];
}

export interface ConnectionsGame {
  id: string;
  title: string;
  description: string;
  mistakesAllowed: number;
  categories: ConnectionsCategory[];
}

export function getConnectionsGame(): ConnectionsGame {
  return gameData as ConnectionsGame;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
