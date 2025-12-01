import { MovementState } from '../state/army/MovementState';

export const move = (state: MovementState): void => {
  if (state.progress < state.path.length - 1) {
    state.progress++;
  }
  if (state.progress === state.path.length - 1) {
    const newPosition = state.path[state.progress];
    state.progress = 0;
    state.path = [newPosition];
  }
};
