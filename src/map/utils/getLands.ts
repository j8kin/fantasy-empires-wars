import { LandState, BattlefieldLands } from '../../types/GameState';
import { NO_PLAYER, PlayerInfo } from '../../types/GamePlayer';
import { Alignment } from '../../types/Alignment';
import { LAND_TYPE } from '../../types/Land';
import { BuildingType } from '../../types/Building';

export type LandPosition = { row: number; col: number };

export const getLands = ({
  lands,
  players,
  landType,
  landAlignment,
  buildings,
  noArmy,
}: {
  lands: BattlefieldLands;
  players?: PlayerInfo[];
  landType?: LAND_TYPE;
  landAlignment?: Alignment;
  buildings?: BuildingType[];
  noArmy?: boolean;
}): LandState[] => {
  return Object.values(lands).filter(
    (tile) =>
      (players == null ||
        (players.length === 0 && tile.controlledBy === NO_PLAYER.id) ||
        (players.length > 0 && players.some((gp) => gp.id === tile.controlledBy))) &&
      (landType == null || tile.land.id === landType) &&
      (landAlignment == null || tile.land.alignment === landAlignment) &&
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
