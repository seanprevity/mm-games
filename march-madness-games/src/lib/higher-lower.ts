import gameData from "@/data/higher-lower.json";

export interface HigherLowerPlayer {
  id: number;
  name: string;
  team: string;
  photo: string;
  nilValue: number;
  nilDisplay: string;
}

export interface HigherLowerGame {
  id: string;
  title: string;
  description: string;
  players: HigherLowerPlayer[];
}

export function getHigherLowerGame(): HigherLowerGame {
  return gameData as HigherLowerGame;
}

export function shufflePlayers(
  players: HigherLowerPlayer[],
): HigherLowerPlayer[] {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
