import { Land } from '../types/Land';
import { Building } from '../types/Building';
import { Armies } from '../types/Army';

export type LandPosition = { row: number; col: number };
export const NO_LAND_POSITION: LandPosition = { row: -1, col: -1 };

export interface LandState {
  mapPos: LandPosition;
  land: Land;
  goldPerTurn: number;
  buildings: Building[];
  army: Armies;
  glow?: boolean;
}

export const getLandId = (landPosition: LandPosition): string =>
  `${landPosition.row}-${landPosition.col}`;
