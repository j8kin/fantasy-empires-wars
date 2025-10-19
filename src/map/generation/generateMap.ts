import { battlefieldLandId, LandState, BattlefieldLands } from '../../types/GameState';
import { getLandById, Land, LAND_TYPE } from '../../types/Land';
import { BattlefieldDimensions } from '../../types/BattlefieldSize';
import { NO_PLAYER } from '../../types/GamePlayer';
import { LandPosition } from '../utils/mapLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';

const positionsToTiles = (pos: LandPosition[], tiles: BattlefieldLands): LandState[] => {
  return pos.map((p) => tiles[battlefieldLandId(p)]).filter((tile) => tile !== undefined);
};

const calculateBaseLandGold = (land: Land): number => {
  const { min, max } = land?.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getNumberOfLands = (tiles: BattlefieldLands, landType: LAND_TYPE): number => {
  return Object.values(tiles).filter((tile) => tile.land.id === landType).length;
};

const getRandomEmptyLandType = (tiles: BattlefieldLands): LandState | null => {
  const emptyLands = Object.values(tiles).filter((tile) => tile.land.id === LAND_TYPE.NONE);
  if (emptyLands.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * emptyLands.length);
  return emptyLands[randomIndex];
};

const getEmptyNeighbors = (
  dimensions: BattlefieldDimensions,
  position: LandPosition,
  tiles: BattlefieldLands
): LandPosition[] =>
  positionsToTiles(getTilesInRadius(dimensions, position, 1), tiles)
    .filter((tile) => tile.land.id === LAND_TYPE.NONE)
    .map((tile) => tile.mapPos);

const getRandomNoneNeighbor = (
  dimensions: BattlefieldDimensions,
  pos: LandPosition,
  tiles: BattlefieldLands
): LandPosition | null => {
  const noneNeighbors = getEmptyNeighbors(dimensions, pos, tiles);

  if (noneNeighbors.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * noneNeighbors.length);
  return noneNeighbors[randomIndex];
};

export const generateMap = (dimensions: BattlefieldDimensions): BattlefieldLands => {
  const { rows, cols } = dimensions;
  const tiles: BattlefieldLands = {};

  // Calculate the total number of tiles
  let totalTiles = 0;
  // Initialize empty tiles
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    totalTiles += colsInRow;

    for (let col = 0; col < colsInRow; col++) {
      const mapPos: LandPosition = { row: row, col: col };
      const tileId = battlefieldLandId(mapPos);
      tiles[tileId] = {
        mapPos: mapPos,
        land: getLandById(LAND_TYPE.NONE), // Temporary, will be overwritten
        controlledBy: NO_PLAYER.id,
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        army: [],
      };
    }
  }

  // 1. Place exactly one volcano
  const volcanoRow = Math.floor(Math.random() * (rows - 4)) + 2;
  const volcanoColsInRow = volcanoRow % 2 === 0 ? cols : cols - 1;
  const volcanoCol = Math.floor(Math.random() * (volcanoColsInRow - 4)) + 2;
  const volcanoPos = { row: volcanoRow, col: volcanoCol };
  const volcanoId = battlefieldLandId(volcanoPos);
  if (tiles[volcanoId]) {
    tiles[volcanoId].land = getLandById(LAND_TYPE.VOLCANO);
  }

  // 2. Place up to 6 lava tiles connected to the volcano
  const lavaPositions: LandPosition[] = [];
  const candidateLavaPositions = getTilesInRadius(dimensions, volcanoPos, 1, true);

  // Randomly select and place lava tiles (up to 6)
  const numLava = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 lava tiles
  const shuffledCandidates = candidateLavaPositions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < numLava && i < shuffledCandidates.length; i++) {
    const lavaPos = shuffledCandidates[i];
    const lavaId = battlefieldLandId(lavaPos);
    if (tiles[lavaId]) {
      tiles[lavaId].land = getLandById(LAND_TYPE.LAVA);
      lavaPositions.push(lavaPos);
    }
  }

  // 3. Set Mountains and DarkForest on Neighbor lands near volcano and lava lands
  getEmptyNeighbors(dimensions, volcanoPos, tiles)?.forEach((neighbor) => {
    const tileId = battlefieldLandId(neighbor);
    if (tiles[tileId]) {
      tiles[tileId].land = getLandById(LAND_TYPE.MOUNTAINS);
    }
  });

  for (const lavaPos of lavaPositions) {
    getEmptyNeighbors(dimensions, lavaPos, tiles)?.forEach((neighbor) => {
      const nMountains = getNumberOfLands(tiles, LAND_TYPE.MOUNTAINS);
      const tileId = battlefieldLandId(neighbor);
      if (tiles[tileId]) {
        tiles[tileId].land = getLandById(
          nMountains < 6 ? LAND_TYPE.MOUNTAINS : LAND_TYPE.DARK_FOREST
        );
      }
    });
  }

  // 4. Get remaining land types (excluding volcano and lava)
  const remainingLandTypes = Object.values(LAND_TYPE).filter(
    (lt) => lt !== LAND_TYPE.VOLCANO && lt !== LAND_TYPE.LAVA && lt !== LAND_TYPE.NONE
  );

  const maxTilesPerType = Math.floor(totalTiles / remainingLandTypes.length);

  remainingLandTypes.forEach((landType) => {
    while (getNumberOfLands(tiles, landType) < maxTilesPerType) {
      let startLand = getRandomEmptyLandType(tiles);
      if (startLand == null) break;
      const tileId = battlefieldLandId(startLand.mapPos);
      if (tiles[tileId]) {
        tiles[tileId].land = getLandById(landType);
      }

      // place 6 land of the same time nearby
      for (let i = 0; i < 5 && getNumberOfLands(tiles, landType) < maxTilesPerType; i++) {
        const emptyNeighbor = getRandomNoneNeighbor(dimensions, startLand.mapPos, tiles);
        if (emptyNeighbor == null) break;
        const neighborTileId = battlefieldLandId(emptyNeighbor);
        if (tiles[neighborTileId]) {
          tiles[neighborTileId].land = getLandById(landType);
          startLand = tiles[neighborTileId];
        }
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(tiles)
    .filter((tile) => tile.land.id === LAND_TYPE.NONE)
    .forEach((tile) => (tile.land = getLandById(LAND_TYPE.DESERT)));

  // Calculate gold for all tiles
  Object.values(tiles).forEach((tile) => {
    tile.goldPerTurn = calculateBaseLandGold(tile.land);
  });

  return tiles;
};
