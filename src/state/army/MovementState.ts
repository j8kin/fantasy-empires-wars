import { LandPosition } from '../map/land/LandPosition';

export interface MovementState {
  progress: number; // index in a path
  path: LandPosition[];
}
