import gameData from "@/data/golf.json";

export interface HeightGolfHole {
  id: number;
  playerName: string;
  team: string;
  photo: string;
  heightInches: number;
  heightDisplay: string;
}

export interface HeightGolfGame {
  id: string;
  title: string;
  description: string;
  holes: HeightGolfHole[];
}

export function getHeightGolfGame(): HeightGolfGame {
  return gameData as HeightGolfGame;
}

export function inchesToDisplay(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}
