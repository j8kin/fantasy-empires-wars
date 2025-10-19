import { Land } from './Land';
import { Building } from './Building';
import { Army } from './Army';
import { GamePlayer } from './GamePlayer';
import { BattlefieldDimensions, BattlefieldSize } from './BattlefieldSize';
import { LandPosition } from '../map/utils/mapLands';

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
  size: BattlefieldDimensions;
  lands: Record<string, LandState>;
};

export interface GameState {
  mapSize: BattlefieldSize;
  battlefield: BattlefieldMap;
  turn: number;
  selectedPlayer: GamePlayer;
  opponents: GamePlayer[];
}

// Helper function to get player by ID from GameState
export const getPlayerById = (gameState?: GameState, playerId?: string): GamePlayer | undefined => {
  if (playerId != null && gameState?.selectedPlayer.id === playerId) {
    return gameState.selectedPlayer;
  }
  return gameState?.opponents.find((player) => player.id === playerId);
};

export const battlefieldLandId = (landPosition: LandPosition): string =>
  `${landPosition.row}-${landPosition.col}`;
