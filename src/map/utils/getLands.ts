import { GameState } from '../../state/GameState';
import { LandState } from '../../state/map/land/LandState';

import { getLandOwner } from '../../selectors/landSelectors';

import { Alignment } from '../../types/Alignment';
import { LandType } from '../../types/Land';
import { BuildingType } from '../../types/Building';
import { NO_PLAYER } from '../../data/players/predefinedPlayers';

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
  const lands = gameState.map.lands;
  return Object.values(lands).filter(
    (landState) =>
      (players == null ||
        (players.length === 0 && getLandOwner(gameState, landState.mapPos) === NO_PLAYER.id) ||
        (players.length > 0 &&
          players.some((gp) => gp === getLandOwner(gameState, landState.mapPos)))) &&
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
