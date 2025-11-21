import { getLand, getLands, LandPosition } from './getLands';
import { BattlefieldDimensions, getLandId, GameState, LandState } from '../../state/GameState';
import { BuildingType } from '../../types/Building';

export const calculateHexDistance = (
  dimensions: BattlefieldDimensions,
  startPoint: LandPosition,
  endPoint: LandPosition
): number => {
  if (!isValidPosition(dimensions, startPoint) || !isValidPosition(dimensions, endPoint)) return -1;

  let visited = new Set<LandPosition>();
  let queue: { pos: LandPosition; dist: number }[] = [];
  visited.add(startPoint);
  queue.push({ pos: startPoint, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pos.row === endPoint.row && current.pos.col === endPoint.col) {
      return current.dist;
    }
    const neighbours = getValidNeighbors(dimensions, current.pos);

    for (let neighbour of neighbours) {
      if (!Array.from(visited).some((n) => n.row === neighbour.row && n.col === neighbour.col)) {
        queue.push({ pos: neighbour, dist: current.dist + 1 });
        visited.add(neighbour);
      }
    }
  }
  return -1; // should never reach here
};

export const findShortestPath = (
  dimensions: BattlefieldDimensions,
  startPosition: LandPosition,
  endPosition: LandPosition
): LandPosition[] => {
  if (!isValidPosition(dimensions, startPosition) || !isValidPosition(dimensions, endPosition)) {
    return [];
  }

  // If start and end are the same position
  if (startPosition.row === endPosition.row && startPosition.col === endPosition.col) {
    return [startPosition];
  }

  const visited = new Set<string>();
  const queue: { pos: LandPosition; path: LandPosition[] }[] = [];

  visited.add(getLandId(startPosition));
  queue.push({ pos: startPosition, path: [startPosition] });

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check if we reached the destination
    if (current.pos.row === endPosition.row && current.pos.col === endPosition.col) {
      return current.path;
    }

    const neighbors = getValidNeighbors(dimensions, current.pos);

    for (const neighbor of neighbors) {
      const neighborKey = getLandId(neighbor);

      if (!visited.has(neighborKey)) {
        //const weight = 1; // Can be modified later for different terrain costs
        const newPath = [...current.path, neighbor];

        queue.push({ pos: neighbor, path: newPath });
        visited.add(neighborKey);
      }
    }
  }
  // No path found
  return [];
};

const excludePosition = (arr: LandPosition[], exclude: LandPosition): LandPosition[] => {
  return arr.filter((pos) => !(pos.row === exclude.row && pos.col === exclude.col));
};

export const getTilesInRadius = (
  dimensions: BattlefieldDimensions,
  center: LandPosition,
  radius: number,
  excludeCenter: boolean = false
): LandPosition[] => {
  if (!isValidPosition(dimensions, center) || radius < 0) return [];

  const queue: { pos: LandPosition; dist: number }[] = [];
  const tilesInRadius: LandPosition[] = [center];

  if (radius === 0) return tilesInRadius;
  if (radius === 1) {
    tilesInRadius.push(...getValidNeighbors(dimensions, center));
    return excludeCenter ? excludePosition(tilesInRadius, center) : tilesInRadius;
  }

  queue.push({ pos: center, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    const neighbours = getValidNeighbors(dimensions, current.pos);

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

export const getNearestStrongholdLand = (
  landPos: LandPosition,
  gameState: GameState,
  radius: number = 1
): LandState | undefined => {
  const allStrongholdsInRadius2 = getLands({
    gameState: gameState,
    buildings: [BuildingType.STRONGHOLD],
  })
    .filter(
      (stronghold) => stronghold.mapPos.row !== landPos.row || stronghold.mapPos.col !== landPos.col
    )
    .filter(
      (stronghold) =>
        calculateHexDistance(gameState.battlefield.dimensions, landPos, stronghold.mapPos) <= radius
    );

  // no stronghold in radius 2
  if (allStrongholdsInRadius2.length === 0) return undefined;

  // if there is a stronghold in radius 2 with the same owner as the land, return it
  const sameOwnerStronghold = allStrongholdsInRadius2.find(
    (s) => s.controlledBy === getLand(gameState, landPos).controlledBy
  );
  if (sameOwnerStronghold) {
    return sameOwnerStronghold;
  }

  // return the closest stronghold in radius 2
  return allStrongholdsInRadius2[0];
};

const isValidPosition = (dimensions: BattlefieldDimensions, pos: LandPosition): boolean => {
  const { rows, cols } = dimensions;
  if (pos.row < 0 || pos.row >= rows) return false;
  const colsInRow = pos.row % 2 === 0 ? cols : cols - 1;
  return pos.col >= 0 && pos.col < colsInRow;
};

const getValidNeighbors = (
  dimensions: BattlefieldDimensions,
  pos: LandPosition
): LandPosition[] => {
  return getHexNeighbors(pos).filter((pos) => isValidPosition(dimensions, pos));
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
