import { getLandId } from '../../state/map/land/LandId';
import { getLand, getLandOwner, getTilesInRadius, hasBuilding } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { hasLand } from '../../systems/playerActions';
import { clearLandBuildings, addPlayerLand, removePlayerLand } from '../../systems/gameStateActions';
import { getMapDimensions } from '../../utils/screenPositionUtils';

import { BuildingName } from '../../types/Building';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';

/**
 * Player could destroy the building as Demolition before construction of a new one
 * it could be destroyed in the battle or by spell from the player opponent
 * @param gameState - Game State (income and player lands could be updated)
 * @param landPos - identify the land where building should be destroyed
 * @returns Updated GameState with buildings destroyed and land ownership changes
 */
export const destroyBuilding = (gameState: GameState, landPos: LandPosition): GameState => {
  const player = getLandOwner(gameState, landPos);
  const landId = getLandId(landPos);
  const isStronghold = hasBuilding(gameState.map.lands[landId], BuildingName.STRONGHOLD);

  let updatedState = clearLandBuildings(gameState, landPos); // delete all buildings since only one could be on the land (todo: think about WALL it could be an additional building for now destroy all)

  if (isStronghold) {
    // if stronghold destroyed then all Lands in radius one should be neutral or could be taken under control by another player
    // if there is an amy on the land not change the owner
    const previousControlledLands = getTilesInRadius(
      getMapDimensions(updatedState),
      updatedState.map.lands[landId].mapPos,
      1,
      false
    );

    previousControlledLands.forEach((l) => {
      const owner = getTurnOwner(updatedState);
      const armiesAtPosition = getArmiesAtPosition(updatedState, l);

      if (armiesAtPosition.length > 0) {
        // if land has army of non-previous owner then change for a new owner (who owns army on this land)
        if (!armiesAtPosition.some((a) => a.controlledBy === player)) {
          updatedState = removePlayerLand(updatedState, owner.id, l);
          const newLandOwnerId = armiesAtPosition[0].controlledBy;
          updatedState = addPlayerLand(updatedState, newLandOwnerId, l);
        }
      } else {
        // no army look for nearest stronghold
        const nearestStrongholds = getTilesInRadius(getMapDimensions(updatedState), l, 1).filter((l) =>
          hasBuilding(getLand(updatedState, l), BuildingName.STRONGHOLD)
        );
        if (nearestStrongholds && nearestStrongholds.length > 0) {
          if (!nearestStrongholds.some((s) => hasLand(owner, s))) {
            const newLandOwnerId = getLandOwner(updatedState, nearestStrongholds[0]);
            updatedState = addPlayerLand(updatedState, newLandOwnerId, l);

            updatedState = removePlayerLand(updatedState, owner.id, l);
          }
        } else {
          updatedState = removePlayerLand(updatedState, owner.id, l);
        }
      }
    });
  }

  return updatedState;
};
