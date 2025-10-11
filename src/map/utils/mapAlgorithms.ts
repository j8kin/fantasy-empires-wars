import { BattlefieldSize, getBattlefieldDimensions } from '../../types/BattlefieldSize';
import { LandPosition } from './mapLands';

export const calculateHexDistance = (
  mapSize: BattlefieldSize,
  startPoint: LandPosition,
  endPoint: LandPosition
): number => {
  if (!isValidPosition(mapSize, startPoint) || !isValidPosition(mapSize, endPoint)) return -1;

  let visited = new Set<LandPosition>();
  let queue: { pos: LandPosition; dist: number }[] = [];
  visited.add(startPoint);
  queue.push({ pos: startPoint, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pos.row === endPoint.row && current.pos.col === endPoint.col) {
      return current.dist;
    }
    const neighbours = getValidNeighbors(mapSize, current.pos);

    for (let neighbour of neighbours) {
      if (!Array.from(visited).some((n) => n.row === neighbour.row && n.col === neighbour.col)) {
        queue.push({ pos: neighbour, dist: current.dist + 1 });
        visited.add(neighbour);
      }
    }
  }
  return -1; // should never reach here
};

const excludePosition = (arr: LandPosition[], exclude: LandPosition): LandPosition[] => {
  return arr.filter((pos) => !(pos.row === exclude.row && pos.col === exclude.col));
};

export const getTilesInRadius = (
  mapSize: BattlefieldSize,
  center: LandPosition,
  radius: number,
  excludeCenter: boolean = false
): LandPosition[] => {
  if (!isValidPosition(mapSize, center) || radius < 0) return [];

  const queue: { pos: LandPosition; dist: number }[] = [];
  const tilesInRadius: LandPosition[] = [center];

  if (radius === 0) return tilesInRadius;
  if (radius === 1) {
    tilesInRadius.push(...getValidNeighbors(mapSize, center));
    return excludeCenter ? excludePosition(tilesInRadius, center) : tilesInRadius;
  }

  queue.push({ pos: center, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    const neighbours = getValidNeighbors(mapSize, current.pos);

    for (let neighbour of neighbours) {
      if (
        !Array.from(tilesInRadius).some(
          (n) => n.row === neighbour.row && n.col === neighbour.col
        ) &&
        current.dist + 1 <= radius
      ) {
        queue.push({ pos: neighbour, dist: current.dist + 1 });
        tilesInRadius.push(neighbour);
      }
    }
  }
  return excludeCenter ? excludePosition(tilesInRadius, center) : tilesInRadius;
};

const isValidPosition = (mapSize: BattlefieldSize, pos: LandPosition): boolean => {
  const { rows, cols } = getBattlefieldDimensions(mapSize);
  if (pos.row < 0 || pos.row >= rows) return false;
  const colsInRow = pos.row % 2 === 0 ? cols : cols - 1;
  return pos.col >= 0 && pos.col < colsInRow;
};

const getValidNeighbors = (mapSize: BattlefieldSize, pos: LandPosition): LandPosition[] => {
  return getHexNeighbors(pos).filter((pos) => isValidPosition(mapSize, pos));
};

// Get neighbors for hexagonal grid (offset coordinates)
const getHexNeighbors = (pos: LandPosition): LandPosition[] => {
  const isEvenRow = pos.row % 2 === 0;

  if (isEvenRow) {
    return [
      { row: pos.row - 1, col: pos.col - 1 }, // NW
      { row: pos.row - 1, col: pos.col }, // NE
      { row: pos.row, col: pos.col + 1 }, // E
      { row: pos.row + 1, col: pos.col }, // SE
      { row: pos.row + 1, col: pos.col - 1 }, // SW
      { row: pos.row, col: pos.col - 1 }, // W
    ];
  } else {
    return [
      { row: pos.row - 1, col: pos.col }, // NW
      { row: pos.row - 1, col: pos.col + 1 }, // NE
      { row: pos.row, col: pos.col + 1 }, // E
      { row: pos.row + 1, col: pos.col + 1 }, // SE
      { row: pos.row + 1, col: pos.col }, // SW
      { row: pos.row, col: pos.col - 1 }, // W
    ];
  }
};
