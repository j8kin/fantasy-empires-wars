import { Land } from './Land';
import { Building } from './Building';
import { Army } from './Army';
import { GamePlayer } from './GamePlayer';
import { LandPosition } from '../map/utils/getLands';
import { EmpireTreasure } from './Treasures';

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
  players: GamePlayer[];
  empireTreasures: EmpireTreasure[];
}

export const getPlayerById = (gameState?: GameState, playerId?: string): GamePlayer | undefined => {
  return gameState?.players.find((player) => player.id === playerId);
};

export const getTurnOwner = (gameState?: GameState): GamePlayer | undefined => {
  return getPlayerById(gameState, gameState?.turnOwner);
};

export const battlefieldLandId = (landPosition: LandPosition): string =>
  `${landPosition.row}-${landPosition.col}`;
