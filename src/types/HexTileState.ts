import { LandType } from './LandType';
import { Building } from './Building';
import { Army } from './Army';
import { Player } from './Player';
import { MapSize } from './MapSize';

export interface HexTileState {
  id: string;
  row: number;
  col: number;
  landType: LandType;
  controlledBy: Player;
  goldPerTurn: number;
  buildings: Building[];
  army: Army;
}

export interface MapState {
  tiles: { [key: string]: HexTileState };
  currentPlayer: Player;
  players: Player[];
  turn: number;
  mapSize: MapSize;
}

export const createTileId = (row: number, col: number): string => `${row}-${col}`;
