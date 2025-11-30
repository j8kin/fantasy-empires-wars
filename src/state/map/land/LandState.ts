import { Land } from '../../../types/Land';
import { Building } from '../../../types/Building';
import { LandPosition } from './LandPosition';

export interface LandState {
  mapPos: LandPosition;
  land: Land;
  goldPerTurn: number;
  buildings: Building[];
  glow?: boolean;
}
