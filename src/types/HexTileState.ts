import { LandType } from './LandType';
import { Building } from './Building';
import { Army } from './Army';
import { GamePlayer } from './GamePlayer';
import { BattlefieldSize } from './BattlefieldSize';
import { Position } from '../map/utils/mapTypes';

export interface HexTileState {
  id: string;
  row: number;
  col: number;
  landType: LandType;
  controlledBy: GamePlayer;
  goldPerTurn: number;
  buildings: Building[];
  army: Army;
}

export interface GameState {
  tiles: { [key: string]: HexTileState };
  turn: number;
  mapSize: BattlefieldSize;
  // Game configuration data
  selectedPlayer?: GamePlayer;
  opponents?: GamePlayer[];
  playerColor?: string;
}

export const createTileId = (position: Position): string => `${position.row}-${position.col}`;
