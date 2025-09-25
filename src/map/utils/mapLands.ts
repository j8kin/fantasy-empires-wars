import { HexTileState } from '../../types/HexTileState';
import { GamePlayer } from '../../types/GamePlayer';
import { Alignment } from '../../types/Alignment';
import { LandType } from '../../types/Land';

export const getLands = (
  tiles: { [key: string]: HexTileState },
  player?: GamePlayer,
  landType?: LandType,
  landAlignment?: Alignment,
  noBuildings?: boolean,
  noArmy?: boolean
): HexTileState[] => {
  return Object.values(tiles).filter(
    (tile) =>
      (player == null || tile.controlledBy === player.id) &&
      (landType == null || tile.landType.id === landType) &&
      (landAlignment == null || tile.landType.alignment === landAlignment) &&
      (noBuildings == null ||
        (noBuildings ? tile.buildings.length === 0 : tile.buildings.length > 0)) &&
      (noArmy == null || (noArmy ? tile.army.units.length === 0 : tile.army.units.length > 0))
  );
};
