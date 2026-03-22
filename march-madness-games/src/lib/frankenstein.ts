import gameData from "@/data/frankenstein.json";

export interface FrankensteinPlayer {
  name: string;
  team: string;
  image: string;
}

export interface FrankensteinRound {
  id: number;
  topPlayer: FrankensteinPlayer;
  middlePlayer: FrankensteinPlayer;
  bottomPlayer: FrankensteinPlayer;
}

export interface FrankensteinGame {
  id: string;
  title: string;
  description: string;
  rounds: FrankensteinRound[];
}

export function getFrankensteinGame(): FrankensteinGame {
  return gameData as FrankensteinGame;
}
