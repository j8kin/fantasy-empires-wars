import type { LandType } from '../../../types/Land';
import type { BuildingState } from '../building/BuildingState';
import type { Effect } from '../../../types/Effect';
import type { LandPosition } from './LandPosition';

export interface LandState {
  type: LandType;
  mapPos: LandPosition;
  goldPerTurn: number;
  buildings: BuildingState[];
  effects: Effect[];
  glow?: boolean;
  corrupted: boolean;
}
