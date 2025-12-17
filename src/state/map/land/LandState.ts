import type { Land } from '../../../types/Land';
import type { Building } from '../../../types/Building';
import type { Effect } from '../../../types/Effect';
import type { LandPosition } from './LandPosition';

export interface LandState {
  mapPos: LandPosition;
  land: Land;
  goldPerTurn: number;
  buildings: Building[];
  effects: Effect[];
  glow?: boolean;
  corrupted: boolean;
}
