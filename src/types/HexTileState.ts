import { LandType } from './LandType';
import { Building } from './Building';
import { Army } from './Army';
import { GamePlayer } from './GamePlayer';
import { BattlefieldSize } from './BattlefieldSize';
import { Position } from '../map/utils/mapTypes';

export interface HexTileState {
  mapPos: Position;
  landType: LandType;
  controlledBy: string;
  goldPerTurn: number;
  buildings: Building[];
  army: Army;
}

export interface GameState {
  mapSize: BattlefieldSize;
  tiles: { [key: string]: HexTileState };
  turn: number;
  // Game configuration data
  selectedPlayer?: GamePlayer;
  opponents?: GamePlayer[];
}

// Helper function to get player by ID from GameState
export const getPlayerById = (gameState?: GameState, playerId?: string): GamePlayer | undefined => {
  if (playerId != null && gameState?.selectedPlayer?.id === playerId) {
    return gameState.selectedPlayer;
  }
  return gameState?.opponents?.find((player) => player.id === playerId);
};

export const createTileId = (position: Position): string => `${position.row}-${position.col}`;
