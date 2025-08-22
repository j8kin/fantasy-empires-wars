import { LandType } from './LandType';
import { Building } from './Building';
import { Army } from './Army';
import { Player } from './Player';

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
  mapSize: 'small' | 'medium' | 'large' | 'huge';
}

export const createTileId = (row: number, col: number): string => `${row}-${col}`;

export const getMapDimensions = (
  mapSize: 'small' | 'medium' | 'large' | 'huge'
): { rows: number; cols: number } => {
  switch (mapSize) {
    case 'small':
      return { rows: 6, cols: 13 };
    case 'medium':
      return { rows: 9, cols: 18 };
    case 'large':
      return { rows: 11, cols: 23 };
    case 'huge':
      return { rows: 15, cols: 31 };
    default:
      return { rows: 9, cols: 18 };
  }
};
