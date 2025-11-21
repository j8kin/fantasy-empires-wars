import { BattlefieldDimensions, BattlefieldLands, BattlefieldMap } from '../../state/GameState';
import { getLandId, LandPosition, LandState } from '../../state/LandState';

import {
  getLandById,
  getMainSpecialLandTypes,
  getNearSpecialLandTypes,
  getRegularLandTypes,
  getSurroundingLands,
  Land,
  LandType,
} from '../../types/Land';
import { getRandomElement } from '../../types/getRandomElement';

import { getTilesInRadius } from '../utils/mapAlgorithms';

const calculateBaseLandGold = (land: Land): number => {
  const { min, max } = land?.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomEmptyLand = (tiles: BattlefieldLands): LandState | undefined => {
  const emptyLands = Object.values(tiles).filter((tile) => tile.land.id === LandType.NONE);
  if (emptyLands.length === 0) return undefined;
  return getRandomElement(emptyLands);
};

const getEmptyNeighbors = (battlefield: BattlefieldMap, position: LandPosition): LandState[] => {
  return getTilesInRadius(battlefield.dimensions, position, 1)
    .map((pos) => battlefield.lands[getLandId(pos)])
    .filter((tile) => tile.land.id === LandType.NONE);
};

const getRandomNoneNeighbor = (
  battlefield: BattlefieldMap,
  pos: LandPosition
): LandState | undefined => {
  const noneNeighbors = getEmptyNeighbors(battlefield, pos);

  if (noneNeighbors.length === 0) return undefined;

  return getRandomElement(noneNeighbors);
};

const createEmptyBattlefield = (dimensions: BattlefieldDimensions): BattlefieldLands => {
  const battlefield: BattlefieldLands = {};
  for (let row = 0; row < dimensions.rows; row++) {
    const colsInRow = row % 2 === 0 ? dimensions.cols : dimensions.cols - 1;

    for (let col = 0; col < colsInRow; col++) {
      const mapPos: LandPosition = { row: row, col: col };

      battlefield[getLandId(mapPos)] = {
        mapPos: mapPos,
        land: getLandById(LandType.NONE), // Temporary, will be overwritten
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        army: [],
      };
    }
  }
  return battlefield;
};

const placeSpecialLand = (battlefield: BattlefieldMap, landType: LandType) => {
  const placedSpecialLands = Object.values(battlefield.lands).filter((land) =>
    getMainSpecialLandTypes().includes(land.land.id)
  );

  let freeToPlaceLands = Object.keys(battlefield.lands).filter(
    (landId) =>
      // exclude border lands
      !placedSpecialLands
        .flatMap((h) => getTilesInRadius(battlefield.dimensions, h.mapPos, 4, false))
        .map((tola) => getLandId(tola))
        .includes(landId)
  );

  if (freeToPlaceLands.length === 0) {
    // fallback to any land free land
    freeToPlaceLands = Object.values(battlefield.lands)
      .filter((land) => land.land.id === LandType.NONE)
      .map((l) => getLandId(l.mapPos));
  }

  const newLandPos = getRandomElement(freeToPlaceLands);
  battlefield.lands[newLandPos].land = getLandById(landType);
  const specialLandPos = battlefield.lands[newLandPos].mapPos;

  const nSupplementedLands = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 supplemented lands need to be placed around special land
  const shuffledCandidates = getTilesInRadius(battlefield.dimensions, specialLandPos, 1, true).sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < nSupplementedLands && i < shuffledCandidates.length; i++) {
    battlefield.lands[getLandId(shuffledCandidates[i])].land = getLandById(
      getNearSpecialLandTypes(landType)
    );
  }

  const specialLandNeighbors = Object.values(battlefield.lands)
    .filter((l) => [landType, getNearSpecialLandTypes(landType)].includes(l.land.id))
    .flatMap((l) => getEmptyNeighbors(battlefield, l.mapPos));

  // set all Neighbors for just placed special lands
  const landType1 = Math.max(specialLandNeighbors.length / 2, 6);

  specialLandNeighbors.forEach((neighbor, idx) => {
    neighbor.land = getLandById(getSurroundingLands(landType)[idx < landType1 ? 0 : 1]);
  });
};

export const generateMap = (dimensions: BattlefieldDimensions): BattlefieldMap => {
  const battlefield: BattlefieldMap = {
    dimensions: dimensions,
    lands: createEmptyBattlefield(dimensions),
  };

  getMainSpecialLandTypes().forEach((specialLandType) =>
    placeSpecialLand(battlefield, specialLandType)
  );

  // 4. Get remaining land types (excluding volcano and lava)
  const remainingLandTypes = getRegularLandTypes();

  const maxTilesPerType = Math.floor(
    Object.keys(battlefield.lands).length / remainingLandTypes.length
  );

  remainingLandTypes.forEach((landType) => {
    while (
      Object.values(battlefield.lands).filter((l) => l.land.id === landType).length <
      maxTilesPerType
    ) {
      let startLand = getRandomEmptyLand(battlefield.lands);
      if (startLand == null) break;
      battlefield.lands[getLandId(startLand.mapPos)].land = getLandById(landType);

      // place 6 land of the same time nearby
      for (
        let i = 0;
        i < 5 &&
        Object.values(battlefield.lands).filter((l) => l.land.id === landType).length <
          maxTilesPerType;
        i++
      ) {
        const emptyNeighbor = getRandomNoneNeighbor(battlefield, startLand.mapPos);
        if (emptyNeighbor == null) break;

        const neighborTileId = getLandId(emptyNeighbor.mapPos);
        battlefield.lands[neighborTileId].land = getLandById(landType);
        startLand = battlefield.lands[neighborTileId];
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(battlefield.lands)
    .filter((tile) => tile.land.id === LandType.NONE)
    .forEach((tile) => (tile.land = getLandById(LandType.DESERT)));

  // Calculate gold for all tiles
  Object.values(battlefield.lands).forEach((tile) => {
    tile.goldPerTurn = calculateBaseLandGold(tile.land);
  });

  return battlefield;
};
