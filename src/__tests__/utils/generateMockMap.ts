import { MapState } from '../../state/map/MapState';
import { MapDimensions } from '../../state/map/MapDimensions';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';

import { getLandById } from '../../domain/land/landRepository';

import { Land, LandType } from '../../types/Land';
import { Alignment } from '../../types/Alignment';

const genLand = (alignment: Alignment | undefined): Land => {
  switch (alignment) {
    case Alignment.LAWFUL:
      return getLandById(LandType.MOUNTAINS);
    case Alignment.NEUTRAL:
      return getLandById(LandType.HILLS);
    case Alignment.CHAOTIC:
      return getLandById(LandType.SWAMP);
    default:
      return getLandById(LandType.PLAINS);
  }
};
export const generateMockMap = (
  dimensions: MapDimensions,
  alignment: Alignment | undefined = undefined,
  income: number | undefined = undefined
): MapState => {
  const result: MapState = {
    dimensions: dimensions,
    lands: {},
  };
  let landNumber = 1;
  for (let row = 0; row < dimensions.rows; row++) {
    const colsInRow = row % 2 === 0 ? dimensions.cols : dimensions.cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const position: LandPosition = { row: row, col: col };
      const key = getLandId(position);
      result.lands[key] = {
        mapPos: position,
        land: genLand(alignment),
        buildings: [],
        effects: [],
        goldPerTurn: income != null ? income : landNumber,
        corrupted: false,
      };
      landNumber++;
    }
  }
  return result;
};
