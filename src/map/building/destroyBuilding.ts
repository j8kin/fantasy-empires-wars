import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { hasLand } from '../../systems/playerActions';
import {
  clearLandBuildings,
  addPlayerLand,
  removePlayerLand,
} from '../../systems/gameStateActions';

import { BuildingType } from '../../types/Building';

import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getMapDimensions } from '../../utils/screenPositionUtils';

/**
 * Player could destroy the building as Demolition before construction of a new one
 * it could be destroyed in the battle or by spell from the player opponent
 * @param gameState - Game State (income and player lands could be updated)
 * @param landPos - identify the land where building should be destroyed
 */
export const destroyBuilding = (gameState: GameState, landPos: LandPosition) => {
  const player = getLandOwner(gameState, landPos);
  const landId = getLandId(landPos);
  const isStronghold = gameState.map.lands[landId].buildings.some(
    (b) => b.id === BuildingType.STRONGHOLD
  );

  Object.assign(gameState, clearLandBuildings(gameState, landPos)); // delete all buildings since only one could be on the land (todo: think about WALL it could be an additional building for now destroy all)

  if (isStronghold) {
    // if stronghold destroyed then all Lands in radius one should be neutral or could be taken under control by another player
    // if there is an amy on the land not change the owner
    const previousControlledLands = getTilesInRadius(
      getMapDimensions(gameState),
      gameState.map.lands[landId].mapPos,
      1,
      false
    );

    previousControlledLands.forEach((l) => {
      const owner = getTurnOwner(gameState);
      const armiesAtPosition = getArmiesAtPosition(gameState, l);

      if (armiesAtPosition.length > 0) {
        // if land has army of non-previous owner then change for a new owner (who owns army on this land)
        if (!armiesAtPosition.some((a) => a.controlledBy === player)) {
          Object.assign(gameState, removePlayerLand(gameState, owner.id, l));
          const newLandOwnerId = armiesAtPosition[0].controlledBy;
          Object.assign(gameState, addPlayerLand(gameState, newLandOwnerId, l));
        }
      } else {
        // no army look for nearest stronghold
        const nearestStrongholds = getTilesInRadius(getMapDimensions(gameState), l, 1).filter((l) =>
          getLand(gameState, l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
        );
        if (nearestStrongholds && nearestStrongholds.length > 0) {
          if (!nearestStrongholds.some((s) => hasLand(owner, s))) {
            const newLandOwnerId = getLandOwner(gameState, nearestStrongholds[0]);
            Object.assign(gameState, addPlayerLand(gameState, newLandOwnerId, l));

            Object.assign(gameState, removePlayerLand(gameState, owner.id, l));
          }
        } else {
          Object.assign(gameState, removePlayerLand(gameState, owner.id, l));
        }
      }
    });
  }
};
