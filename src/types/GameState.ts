import { Land } from './Land';
import { Building } from './Building';
import { Armies } from './Army';
import { PlayerState } from './GamePlayer';
import { LandPosition } from '../map/utils/getLands';

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
  army: Armies;
  glow?: boolean;
}
export type BattlefieldMap = {
  dimensions: BattlefieldDimensions;
  lands: BattlefieldLands;
};

export enum TurnPhase {
  START = 'START',
  MAIN = 'MAIN',
  END = 'END',
}

export interface GameState {
  battlefield: BattlefieldMap;
  turn: number;
  turnOwner: string;
  turnPhase: TurnPhase;
  players: PlayerState[];
}

export const getPlayerById = (
  gameState?: GameState,
  playerId?: string
): PlayerState | undefined => {
  return gameState?.players.find((player) => player.playerId === playerId);
};

export const getTurnOwner = (gameState?: GameState): PlayerState | undefined => {
  return getPlayerById(gameState, gameState?.turnOwner);
};

export const battlefieldLandId = (landPosition: LandPosition): string =>
  `${landPosition.row}-${landPosition.col}`;
