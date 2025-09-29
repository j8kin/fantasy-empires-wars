import { createTileId, MapTilesType } from '../../types/HexTileState';
import { Position } from '../../map/utils/mapTypes';
import { getLandById, LAND_TYPE } from '../../types/Land';
import { NO_PLAYER } from '../../types/GamePlayer';

export const generateMockMap = (rows: number, cols: number): MapTilesType => {
  const result: MapTilesType = {};
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const position: Position = { row: row, col: col };
      const key = createTileId(position);
      result[key] = {
        mapPos: position,
        landType: getLandById(LAND_TYPE.PLAINS),
        controlledBy: NO_PLAYER.id,
        buildings: [],
        goldPerTurn: 0,
        army: [],
      };
    }
  }
  return result;
};
