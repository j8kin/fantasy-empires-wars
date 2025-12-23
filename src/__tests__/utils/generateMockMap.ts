import { getLandId } from '../../state/map/land/LandId';
import { getLandById } from '../../domain/land/landRepository';
import { LandKind } from '../../types/Land';
import { Alignment } from '../../types/Alignment';

import type { MapState } from '../../state/map/MapState';
import type { MapDimensions } from '../../state/map/MapDimensions';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { Land } from '../../types/Land';
import type { AlignmentType } from '../../types/Alignment';

const genLand = (alignment: AlignmentType | undefined): Land => {
  switch (alignment) {
    case Alignment.LAWFUL:
      return getLandById(LandKind.MOUNTAINS);
    case Alignment.NEUTRAL:
      return getLandById(LandKind.HILLS);
    case Alignment.CHAOTIC:
      return getLandById(LandKind.SWAMP);
    default:
      return getLandById(LandKind.PLAINS);
  }
};
export const generateMockMap = (
  dimensions: MapDimensions,
  alignment: AlignmentType | undefined = undefined,
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
