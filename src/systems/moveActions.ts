import { MovementState } from '../state/army/MovementState';
import { LandPosition } from '../state/map/land/LandPosition';
import { findShortestPath } from '../map/utils/mapAlgorithms';

export const startMovement = (state: MovementState, to: LandPosition): void => {
  const from = state.path[state.progress];
  state.path = findShortestPath({ rows: 100, cols: 100 }, from, to);
};
