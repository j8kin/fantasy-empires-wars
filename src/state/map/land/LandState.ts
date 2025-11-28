import { Land } from '../../../types/Land';
import { Building } from '../../../types/Building';
import { Armies } from '../../army/ArmyState';
import { LandPosition } from './LandPosition';

export interface LandState {
  mapPos: LandPosition;
  land: Land;
  goldPerTurn: number;
  buildings: Building[];
  army: Armies;
  glow?: boolean;
}
