import { LandState, BattlefieldLands } from '../../types/GameState';
import { NO_PLAYER, PlayerInfo } from '../../types/GamePlayer';
import { Alignment } from '../../types/Alignment';
import { LAND_TYPE } from '../../types/Land';
import { BuildingType } from '../../types/Building';

export type LandPosition = { row: number; col: number };

export const getLands = ({
  lands,
  players,
  landTypes,
  landAlignment,
  buildings,
  noArmy,
}: {
  lands: BattlefieldLands;
  players?: PlayerInfo[];
  landTypes?: LAND_TYPE[];
  landAlignment?: Alignment;
  buildings?: BuildingType[];
  noArmy?: boolean;
}): LandState[] => {
  return Object.values(lands).filter(
    (landState) =>
      (players == null ||
        (players.length === 0 && landState.controlledBy === NO_PLAYER.id) ||
        (players.length > 0 && players.some((gp) => gp.id === landState.controlledBy))) &&
      (landTypes == null || landTypes.includes(landState.land.id)) &&
      (landAlignment == null || landState.land.alignment === landAlignment) &&
      // ignore buildings
      (buildings == null ||
        // require no building on Land
        (buildings.length === 0 && landState.buildings.length === 0) ||
        // require building from the list
        (buildings.length > 0 &&
          landState.buildings.length > 0 &&
          landState.buildings.some((b) => buildings.includes(b.id)))) &&
      (noArmy == null || (noArmy ? landState.army.length === 0 : landState.army.length > 0))
  );
};
