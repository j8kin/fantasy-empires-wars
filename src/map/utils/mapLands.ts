import { HexTileState, MapTilesType } from '../../types/HexTileState';
import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';
import { Alignment } from '../../types/Alignment';
import { LandType } from '../../types/Land';
import { BuildingType } from '../../types/Building';

export const getLands = (
  tiles: MapTilesType,
  player?: GamePlayer[],
  landType?: LandType,
  landAlignment?: Alignment,
  buildings?: BuildingType[],
  noArmy?: boolean
): HexTileState[] => {
  return Object.values(tiles).filter(
    (tile) =>
      (player == null ||
        (player.length === 0 && tile.controlledBy === NO_PLAYER.id) ||
        (player.length > 0 && player.some((gp) => gp.id === tile.controlledBy))) &&
      (landType == null || tile.landType.id === landType) &&
      (landAlignment == null || tile.landType.alignment === landAlignment) &&
      // ignore buildings
      (buildings == null ||
        // require no building on Land
        (buildings.length === 0 && tile.buildings.length === 0) ||
        // require building from the list
        (buildings.length > 0 &&
          tile.buildings.length > 0 &&
          tile.buildings.some((b) => buildings.includes(b.id)))) &&
      (noArmy == null || (noArmy ? tile.army.length === 0 : tile.army.length > 0))
  );
};
