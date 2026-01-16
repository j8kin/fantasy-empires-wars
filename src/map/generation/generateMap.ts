import { getLandId } from '../../state/map/land/LandId';
import { getTilesInRadius } from '../../selectors/landSelectors';
import { getLandById } from '../../domain/land/landRepository';
import {
  getSurroundingLands,
  getNearSpecialLandKinds,
  getMainSpecialLandKinds,
  getRegularLandKinds,
} from '../../domain/land/landRelationships';
import { getRandomElement } from '../../domain/utils/random';
import { LandName } from '../../types/Land';
import type { LandType } from '../../types/Land';
import type { Land } from '../../types/Land';
import type { MapState } from '../../state/map/MapState';
import type { MapLands } from '../../state/map/MapState';
import type { LandState } from '../../state/map/land/LandState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { MapDimensions } from '../../state/map/MapDimensions';

const calculateBaseLandGold = (land: Land): number => {
  const { min, max } = land?.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomEmptyLand = (tiles: MapLands): LandState | undefined => {
  const emptyLands = Object.values(tiles).filter((tile) => tile.land.type === LandName.NONE);
  if (emptyLands.length === 0) return undefined;
  return getRandomElement(emptyLands);
};

const getEmptyNeighbors = (battlefield: MapState, position: LandPosition): LandState[] => {
  return getTilesInRadius(battlefield.dimensions, position, 1)
    .map((pos) => battlefield.lands[getLandId(pos)])
    .filter((tile) => tile.land.type === LandName.NONE);
};

const getRandomNoneNeighbor = (battlefield: MapState, pos: LandPosition): LandState | undefined => {
  const noneNeighbors = getEmptyNeighbors(battlefield, pos);

  if (noneNeighbors.length === 0) return undefined;

  return getRandomElement(noneNeighbors);
};

const createEmptyBattlefield = (dimensions: MapDimensions): MapLands => {
  const battlefield: MapLands = {};
  for (let row = 0; row < dimensions.rows; row++) {
    const colsInRow = row % 2 === 0 ? dimensions.cols : dimensions.cols - 1;

    for (let col = 0; col < colsInRow; col++) {
      const mapPos: LandPosition = { row: row, col: col };

      battlefield[getLandId(mapPos)] = {
        mapPos: mapPos,
        land: getLandById(LandName.NONE), // Temporary, will be overwritten
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        effects: [],
        corrupted: false,
      };
    }
  }
  return battlefield;
};

const placeSpecialLand = (battlefield: MapState, landKind: LandType) => {
  const placedSpecialLands = Object.values(battlefield.lands).filter((land) =>
    getMainSpecialLandKinds().includes(land.land.type)
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
      .filter((land) => land.land.type === LandName.NONE)
      .map((l) => getLandId(l.mapPos));
  }

  const newLandPos = getRandomElement(freeToPlaceLands);
  battlefield.lands[newLandPos].land = getLandById(landKind);
  const specialLandPos = battlefield.lands[newLandPos].mapPos;

  const nSupplementedLands = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 supplemented lands need to be placed around special land
  const shuffledCandidates = getTilesInRadius(battlefield.dimensions, specialLandPos, 1, true).sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < nSupplementedLands && i < shuffledCandidates.length; i++) {
    battlefield.lands[getLandId(shuffledCandidates[i])].land = getLandById(getNearSpecialLandKinds(landKind));
  }

  const specialLandNeighbors = Object.values(battlefield.lands)
    .filter((l) => [landKind, getNearSpecialLandKinds(landKind)].includes(l.land.type))
    .flatMap((l) => getEmptyNeighbors(battlefield, l.mapPos));

  // set all Neighbors for just placed special lands
  const LandKind1 = Math.max(specialLandNeighbors.length / 2, 6);

  specialLandNeighbors.forEach((neighbor, idx) => {
    neighbor.land = getLandById(getSurroundingLands(landKind)[idx < LandKind1 ? 0 : 1]);
  });
};

export const generateMap = (dimensions: MapDimensions): MapState => {
  const battlefield: MapState = {
    dimensions: dimensions,
    lands: createEmptyBattlefield(dimensions),
  };

  getMainSpecialLandKinds().forEach((specialLandKind) => placeSpecialLand(battlefield, specialLandKind));

  // 4. Get remaining land types (excluding volcano and lava)
  const remainingLandKinds = getRegularLandKinds();

  const maxTilesPerType = Math.floor(Object.keys(battlefield.lands).length / remainingLandKinds.length);

  remainingLandKinds.forEach((LandKind) => {
    while (Object.values(battlefield.lands).filter((l) => l.land.type === LandKind).length < maxTilesPerType) {
      let startLand = getRandomEmptyLand(battlefield.lands);
      if (startLand == null) break;
      battlefield.lands[getLandId(startLand.mapPos)].land = getLandById(LandKind);

      // place 6 land of the same time nearby
      for (
        let i = 0;
        i < 5 && Object.values(battlefield.lands).filter((l) => l.land.type === LandKind).length < maxTilesPerType;
        i++
      ) {
        const emptyNeighbor = getRandomNoneNeighbor(battlefield, startLand.mapPos);
        if (emptyNeighbor == null) break;

        const neighborTileId = getLandId(emptyNeighbor.mapPos);
        battlefield.lands[neighborTileId].land = getLandById(LandKind);
        startLand = battlefield.lands[neighborTileId];
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(battlefield.lands)
    .filter((tile) => tile.land.type === LandName.NONE)
    .forEach((tile) => (tile.land = getLandById(LandName.DESERT)));

  // Calculate gold for all tiles
  Object.values(battlefield.lands).forEach((tile) => {
    tile.goldPerTurn = calculateBaseLandGold(tile.land);
  });

  return battlefield;
};
