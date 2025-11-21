import { BattlefieldMap, getLandId, BattlefieldDimensions } from '../../types/GameState';
import { LandPosition } from '../../map/utils/getLands';
import { getLandById, Land, LandType } from '../../types/Land';
import { NO_PLAYER } from '../../types/PlayerState';
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
  dimensions: BattlefieldDimensions,
  alignment: Alignment | undefined = undefined,
  income: number | undefined = undefined
): BattlefieldMap => {
  const result: BattlefieldMap = {
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
        controlledBy: NO_PLAYER.id,
        buildings: [],
        goldPerTurn: income != null ? income : landNumber,
        army: [],
      };
      landNumber++;
    }
  }
  return result;
};
