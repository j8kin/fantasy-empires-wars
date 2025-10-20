import { Land } from './Land';
import { Building } from './Building';
import { Army } from './Army';
import { GamePlayer } from './GamePlayer';
import { LandPosition } from '../map/utils/mapLands';

export interface BattlefieldDimensions {
  rows: number;
  cols: number;
}

export type BattlefieldLands = Record<string, LandState>;

export interface LandState {
  mapPos: LandPosition;
  land: Land;
  controlledBy: string;
  goldPerTurn: number;
  buildings: Building[];
  army: Army;
  glow?: boolean;
}
export type BattlefieldMap = {
  dimensions: BattlefieldDimensions;
  lands: Record<string, LandState>;
};

export interface GameState {
  battlefield: BattlefieldMap;
  turn: number;
  activePlayerId: string;
  players: GamePlayer[];
}

// Helper function to get player by ID from GameState
export const getPlayerById = (gameState?: GameState, playerId?: string): GamePlayer | undefined => {
  return gameState?.players.find((player) => player.id === playerId);
};

// Helper function to get the selected player (active player) from GameState
export const getSelectedPlayer = (gameState?: GameState): GamePlayer | undefined => {
  return getPlayerById(gameState, gameState?.activePlayerId);
};

export const battlefieldLandId = (landPosition: LandPosition): string =>
  `${landPosition.row}-${landPosition.col}`;
