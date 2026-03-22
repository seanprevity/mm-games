import gameData from "@/data/player.json";
import type { PlayerGuessGameData } from "@/types/types";

export function getPlayerPathGame(): PlayerGuessGameData {
  return gameData as PlayerGuessGameData;
}
