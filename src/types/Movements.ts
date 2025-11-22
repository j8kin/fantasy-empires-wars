import { LandPosition } from '../state/LandState';
import { findShortestPath } from '../map/utils/mapAlgorithms';

export interface Movements {
  mp: number;
  path: LandPosition[];

  from(): LandPosition;
  to(): LandPosition;
  move(): void;
  position(): LandPosition;
}

export const createMovement = (from: LandPosition, to: LandPosition): Movements => {
  let currentPosition: LandPosition = from;
  let idx = 0;

  return {
    mp: 0,
    path: findShortestPath({ rows: 100, cols: 100 }, from, to), // todo something with dimensions

    position: function (): LandPosition {
      return currentPosition;
    },

    move: function (): void {
      currentPosition = this.path[idx++];
    },
    from: function (): LandPosition {
      return from;
    },
    to: function (): LandPosition {
      return to;
    },
  };
};
