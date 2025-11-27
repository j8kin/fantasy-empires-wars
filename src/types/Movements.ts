import { INVALID, LandPosition } from '../state/LandState';
import { findShortestPath } from '../map/utils/mapAlgorithms';

export interface Movements {
  mp: number;

  get position(): LandPosition;
  get from(): LandPosition;
  get to(): LandPosition;
  startMoving(from: LandPosition, to: LandPosition): void;
  move(): void;
}

export const placeArmy = (initPos: LandPosition): Movements => {
  let cPos: LandPosition = initPos;
  let path: LandPosition[] = [];
  let fromPos: LandPosition = INVALID;

  return {
    mp: 0,
    get position(): LandPosition {
      return cPos;
    },
    get from(): LandPosition {
      return fromPos;
    },
    get to(): LandPosition {
      return path.length > 0 ? path[path.length - 1] : INVALID;
    },

    startMoving: (from, to) => {
      path = findShortestPath({ rows: 100, cols: 100 }, from, to); //todo think about battlefield size
      fromPos = path.shift()!;
    },

    move: function (): void {
      if (path.length > 0) {
        cPos = path.shift()!;
      }
      if (path.length === 0) {
        fromPos = INVALID; // reach destination
      }
    },
  };
};
