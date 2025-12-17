import type { LandPosition } from '../state/map/land/LandPosition';
import type { MovementState } from '../state/army/MovementState';

export const movementFactory = (position: LandPosition): MovementState => ({
  path: [position],
  progress: 0,
});
