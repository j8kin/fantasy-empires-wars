import { GameState, getLandId } from '../../state/GameState';
import { LandPosition, LandState } from '../../state/LandState';
import { NO_PLAYER } from '../../state/PlayerState';

import { Alignment } from '../../types/Alignment';
import { LandType } from '../../types/Land';
import { BuildingType } from '../../types/Building';

export const getLands = ({
  gameState,
  players,
  landTypes,
  landAlignment,
  buildings,
  noArmy,
}: {
  gameState: GameState;
  players?: string[];
  landTypes?: LandType[];
  landAlignment?: Alignment;
  buildings?: BuildingType[];
  noArmy?: boolean;
}): LandState[] => {
  const lands = gameState.battlefield.lands;
  return Object.values(lands).filter(
    (landState) =>
      (players == null ||
        (players.length === 0 && landState.controlledBy === NO_PLAYER.id) ||
        (players.length > 0 && players.some((gp) => gp === landState.controlledBy))) &&
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

export const getLand = (gameState: GameState, landPos: LandPosition): LandState =>
  gameState.battlefield.lands[getLandId(landPos)];
