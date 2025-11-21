import { PlayerState } from './PlayerState';
import { LandState } from './LandState';

export interface BattlefieldDimensions {
  rows: number;
  cols: number;
}

export type BattlefieldLands = Record<string, LandState>;

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
