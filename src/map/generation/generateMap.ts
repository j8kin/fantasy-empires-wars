import {
  BattlefieldDimensions,
  battlefieldLandId,
  BattlefieldLands,
  BattlefieldMap,
  LandState,
} from '../../types/GameState';
import {
  getLandById,
  getMainSpecialLandTypes,
  getNearSpecialLandTypes,
  getRegularLandTypes,
  getSurroundingLands,
  Land,
  LAND_TYPE,
} from '../../types/Land';
import { NO_PLAYER } from '../../types/GamePlayer';
import { getLands, LandPosition } from '../utils/getLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getRandomElement } from './getRandomElement';

const calculateBaseLandGold = (land: Land): number => {
  const { min, max } = land?.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomEmptyLand = (tiles: BattlefieldLands): LandState | undefined => {
  const emptyLands = Object.values(tiles).filter((tile) => tile.land.id === LAND_TYPE.NONE);
  if (emptyLands.length === 0) return undefined;
  return getRandomElement(emptyLands);
};

const getEmptyNeighbors = (battlefield: BattlefieldMap, position: LandPosition): LandState[] => {
  return getTilesInRadius(battlefield.dimensions, position, 1)
    .map((pos) => battlefield.lands[battlefieldLandId(pos)])
    .filter((tile) => tile.land.id === LAND_TYPE.NONE);
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

      battlefield[battlefieldLandId(mapPos)] = {
        mapPos: mapPos,
        land: getLandById(LAND_TYPE.NONE), // Temporary, will be overwritten
        controlledBy: NO_PLAYER.id,
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        army: [],
      };
    }
  }
  return battlefield;
};

const placeSpecialLand = (battlefield: BattlefieldMap, landType: LAND_TYPE) => {
  const placedSpecialLands = getLands({
    lands: battlefield.lands,
    landTypes: getMainSpecialLandTypes(),
  });

  let freeToPlaceLands = Object.keys(battlefield.lands).filter(
    (landId) =>
      // exclude border lands
      !placedSpecialLands
        .flatMap((h) => getTilesInRadius(battlefield.dimensions, h.mapPos, 4, false))
        .map((tola) => battlefieldLandId(tola))
        .includes(landId)
  );

  if (freeToPlaceLands.length === 0) {
    // fallback to any land free land
    freeToPlaceLands = Object.values(battlefield.lands)
      .filter((land) => land.land.id === LAND_TYPE.NONE)
      .map((l) => battlefieldLandId(l.mapPos));
  }

  const newLandPos = getRandomElement(freeToPlaceLands);
  battlefield.lands[newLandPos].land = getLandById(landType);
  const specialLandPos = battlefield.lands[newLandPos].mapPos;

  const nSupplementedLands = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 supplemented lands need to be placed around special land
  const shuffledCandidates = getTilesInRadius(battlefield.dimensions, specialLandPos, 1, true).sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < nSupplementedLands && i < shuffledCandidates.length; i++) {
    battlefield.lands[battlefieldLandId(shuffledCandidates[i])].land = getLandById(
      getNearSpecialLandTypes(landType)
    );
  }

  const specialLandNeighbors = getLands({
    lands: battlefield.lands,
    landTypes: [landType, getNearSpecialLandTypes(landType)],
  }).flatMap((l) => getEmptyNeighbors(battlefield, l.mapPos));

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
    while (getLands({ lands: battlefield.lands, landTypes: [landType] }).length < maxTilesPerType) {
      let startLand = getRandomEmptyLand(battlefield.lands);
      if (startLand == null) break;
      battlefield.lands[battlefieldLandId(startLand.mapPos)].land = getLandById(landType);

      // place 6 land of the same time nearby
      for (
        let i = 0;
        i < 5 &&
        getLands({ lands: battlefield.lands, landTypes: [landType] }).length < maxTilesPerType;
        i++
      ) {
        const emptyNeighbor = getRandomNoneNeighbor(battlefield, startLand.mapPos);
        if (emptyNeighbor == null) break;

        const neighborTileId = battlefieldLandId(emptyNeighbor.mapPos);
        battlefield.lands[neighborTileId].land = getLandById(landType);
        startLand = battlefield.lands[neighborTileId];
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(battlefield.lands)
    .filter((tile) => tile.land.id === LAND_TYPE.NONE)
    .forEach((tile) => (tile.land = getLandById(LAND_TYPE.DESERT)));

  // Calculate gold for all tiles
  Object.values(battlefield.lands).forEach((tile) => {
    tile.goldPerTurn = calculateBaseLandGold(tile.land);
  });

  return battlefield;
};
