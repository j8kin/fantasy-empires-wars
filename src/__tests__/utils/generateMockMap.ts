import { BattlefieldMap, battlefieldLandId, BattlefieldDimensions } from '../../types/GameState';
import { LandPosition } from '../../map/utils/mapLands';
import { getLandById, LAND_TYPE } from '../../types/Land';
import { NO_PLAYER } from '../../types/GamePlayer';

export const generateMockMap = (dimensions: BattlefieldDimensions): BattlefieldMap => {
  const result: BattlefieldMap = {
    dimensions: dimensions,
    lands: {},
  };
  let landNumber = 1;
  for (let row = 0; row < dimensions.rows; row++) {
    const colsInRow = row % 2 === 0 ? dimensions.cols : dimensions.cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const position: LandPosition = { row: row, col: col };
      const key = battlefieldLandId(position);
      result.lands[key] = {
        mapPos: position,
        land: getLandById(LAND_TYPE.PLAINS),
        controlledBy: NO_PLAYER.id,
        buildings: [],
        goldPerTurn: landNumber,
        army: [],
      };
      landNumber++;
    }
  }
  return result;
};
