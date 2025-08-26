import { HexTileState, createTileId } from '../types/HexTileState';
import { LAND_TYPES, LandType } from '../types/LandType';
import { NEUTRAL_PLAYER } from '../types/Player';
import { MapSize, getMapDimensions } from '../types/MapSize';

const calculateBaseLandGold = (landType: LandType): number => {
  const { min, max } = landType.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get neighbors for hexagonal grid (offset coordinates)
const getHexNeighbors = (row: number, col: number): { row: number; col: number }[] => {
  const isEvenRow = row % 2 === 0;

  if (isEvenRow) {
    return [
      { row: row - 1, col: col - 1 }, // NW
      { row: row - 1, col: col }, // NE
      { row: row, col: col + 1 }, // E
      { row: row + 1, col: col }, // SE
      { row: row + 1, col: col - 1 }, // SW
      { row: row, col: col - 1 }, // W
    ];
  } else {
    return [
      { row: row - 1, col: col }, // NW
      { row: row - 1, col: col + 1 }, // NE
      { row: row, col: col + 1 }, // E
      { row: row + 1, col: col + 1 }, // SE
      { row: row + 1, col: col }, // SW
      { row: row, col: col - 1 }, // W
    ];
  }
};

const isValidPosition = (mapSize: MapSize, row: number, col: number): boolean => {
  const { rows, cols } = getMapDimensions(mapSize);
  if (row < 0 || row >= rows) return false;
  const colsInRow = row % 2 === 0 ? cols : cols - 1;
  return col >= 0 && col < colsInRow;
};

const getValidNeighbors = (
  mapSize: MapSize,
  row: number,
  col: number
): { row: number; col: number }[] => {
  return getHexNeighbors(row, col).filter((pos) => isValidPosition(mapSize, pos.row, pos.col));
};

const getEmptyNeighbors = (
  mapSize: MapSize,
  row: number,
  col: number,
  tiles: { [key: string]: HexTileState }
): { row: number; col: number }[] | null => {
  const validNeighbors = getValidNeighbors(mapSize, row, col);
  const noneNeighbors = validNeighbors.filter((pos) => {
    const tileId = createTileId(pos.row, pos.col);
    return tiles[tileId] && tiles[tileId].landType.id === 'none';
  });

  if (noneNeighbors.length === 0) {
    return null;
  }
  return noneNeighbors;
};

const getRandomNoneNeighbor = (
  mapSize: MapSize,
  row: number,
  col: number,
  tiles: { [key: string]: HexTileState }
): { row: number; col: number } | null => {
  const noneNeighbors = getEmptyNeighbors(mapSize, row, col, tiles);

  if (noneNeighbors == null) return null;

  const randomIndex = Math.floor(Math.random() * noneNeighbors.length);
  return noneNeighbors[randomIndex];
};

const getNumberOfLands = (tiles: { [key: string]: HexTileState }, landType: LandType): number => {
  return Object.values(tiles).filter((tile) => tile.landType.id === landType.id).length;
};

const getRandomEmptyLandType = (tiles: { [key: string]: HexTileState }): HexTileState | null => {
  const empyLands = Object.values(tiles).filter((tile) => tile.landType.id === LAND_TYPES.none.id);
  if (empyLands.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * empyLands.length);
  return empyLands[randomIndex];
};

export const initializeMap = (mapSize: MapSize): { [key: string]: HexTileState } => {
  const { rows, cols } = getMapDimensions(mapSize);
  const tiles: { [key: string]: HexTileState } = {};

  // Calculate total number of tiles
  let totalTiles = 0;
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    totalTiles += colsInRow;
  }

  // Initialize empty tiles
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const tileId = createTileId(row, col);
      tiles[tileId] = {
        id: tileId,
        row,
        col,
        landType: LAND_TYPES.none, // Temporary, will be overwritten
        controlledBy: NEUTRAL_PLAYER,
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        army: { units: [], totalCount: 0 },
      };
    }
  }

  // 1. Place exactly one volcano
  const volcanoRow = Math.floor(Math.random() * rows);
  const volcanoColsInRow = volcanoRow % 2 === 0 ? cols : cols - 1;
  const volcanoCol = Math.floor(Math.random() * volcanoColsInRow);
  const volcanoId = createTileId(volcanoRow, volcanoCol);
  tiles[volcanoId].landType = LAND_TYPES.volcano;

  // 2. Place up to 6 lava tiles connected to volcano
  const lavaPositions: { row: number; col: number }[] = [];
  const candidateLavaPositions = getValidNeighbors(mapSize, volcanoRow, volcanoCol);

  // Randomly select and place lava tiles (up to 6)
  const numLava = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 lava tiles
  const shuffledCandidates = candidateLavaPositions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < numLava && i < shuffledCandidates.length; i++) {
    const lavaPos = shuffledCandidates[i];
    const lavaId = createTileId(lavaPos.row, lavaPos.col);
    tiles[lavaId].landType = LAND_TYPES.lava;
    lavaPositions.push(lavaPos);
  }

  // 3. Set Mountains and DarkForest on Neighbor lands near volcano and lava lands
  getEmptyNeighbors(mapSize, volcanoRow, volcanoCol, tiles)?.forEach((neighbor) => {
    tiles[createTileId(neighbor.row, neighbor.col)].landType = LAND_TYPES.mountains;
  });

  for (const lavaPos of lavaPositions) {
    getEmptyNeighbors(mapSize, lavaPos.row, lavaPos.col, tiles)?.forEach((neighbor) => {
      const nMountains = getNumberOfLands(tiles, LAND_TYPES.mountains);
      tiles[createTileId(neighbor.row, neighbor.col)].landType =
        nMountains < 6 ? LAND_TYPES.mountains : LAND_TYPES.darkforest;
    });
  }

  // 4. Get remaining land types (excluding volcano and lava)
  const remainingLandTypes = Object.values(LAND_TYPES).filter(
    (lt) => lt.id !== 'volcano' && lt.id !== 'lava' && lt.id !== 'none'
  );

  const maxTilesPerType = Math.floor(totalTiles / remainingLandTypes.length);

  remainingLandTypes.forEach((landType) => {
    while (getNumberOfLands(tiles, landType) < maxTilesPerType) {
      let startLand = getRandomEmptyLandType(tiles);
      if (startLand == null) break;
      tiles[startLand.id].landType = landType;

      // place 6 land of the same time nearby
      for (let i = 0; i < 5 && getNumberOfLands(tiles, landType) < maxTilesPerType; i++) {
        const emptyNeighbor = getRandomNoneNeighbor(mapSize, startLand.row, startLand.col, tiles);
        if (emptyNeighbor == null) break;
        tiles[createTileId(emptyNeighbor.row, emptyNeighbor.col)].landType = landType;
        startLand = tiles[createTileId(emptyNeighbor.row, emptyNeighbor.col)];
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(tiles)
    .filter((tile) => tile.landType.id === LAND_TYPES.none.id)
    .forEach((tile) => (tile.landType = LAND_TYPES.desert));

  // Calculate gold for all tiles
  Object.values(tiles).forEach((tile) => {
    tile.goldPerTurn = calculateBaseLandGold(tile.landType);
  });

  return tiles;
};
