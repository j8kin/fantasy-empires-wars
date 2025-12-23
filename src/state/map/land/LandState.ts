import type { Land } from '../../../types/Land';
import type { BuildingState } from '../building/BuildingState';
import type { Effect } from '../../../types/Effect';
import type { LandPosition } from './LandPosition';

export interface LandState {
  mapPos: LandPosition;
  land: Land;
  goldPerTurn: number;
  buildings: BuildingState[];
  effects: Effect[];
  glow?: boolean;
  corrupted: boolean;
}
