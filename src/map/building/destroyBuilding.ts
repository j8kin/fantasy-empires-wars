import { GameState } from '../../state/GameState';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getPlayer, getTurnOwner } from '../../selectors/playerSelectors';
import { addLand, hasLand, removeLand } from '../../systems/playerActions';

import { BuildingType } from '../../types/Building';

import { getTilesInRadius } from '../utils/mapAlgorithms';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';

/**
 * Player could destroy the building as Demolition before construction of a new one
 * it could be destroyed in the battle or by spell from the player opponent
 * @param landPos - identify the land where building should be destroyed
 * @param gameState - Game State (income and player lands could be updated)
 */
export const destroyBuilding = (landPos: LandPosition, gameState: GameState) => {
  const player = getLandOwner(gameState, landPos);
  const landId = getLandId(landPos);
  const isStronghold = gameState.map.lands[landId].buildings.some(
    (b) => b.id === BuildingType.STRONGHOLD
  );

  gameState.map.lands[landId].buildings = []; // delete all buildings since only one could be on the land (todo: think about WALL it could be an additional building for now destroy all)

  if (isStronghold) {
    // if stronghold destroyed then all Lands in radius one should be neutral or could be taken under control by another player
    // if there is an amy on the land not change the owner
    const previousControlledLands = getTilesInRadius(
      gameState.map.dimensions,
      gameState.map.lands[landId].mapPos,
      1,
      false
    );

    previousControlledLands.forEach((l) => {
      const owner = getTurnOwner(gameState);
      if (gameState.map.lands[getLandId(l)].army.length > 0) {
        // if land has army of non-previous owner then change for a new owner (who owns army on this land)
        if (!gameState.map.lands[getLandId(l)].army.some((a) => a.controlledBy === player)) {
          removeLand(owner, l);
          const newLandOwner = getPlayer(
            gameState,
            gameState.map.lands[getLandId(l)].army[0].controlledBy
          );
          addLand(newLandOwner, l);
        }
      } else {
        // no army look for nearest stronghold
        const nearestStrongholds = getTilesInRadius(gameState.map.dimensions, l, 1).filter((l) =>
          getLand(gameState, l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
        );
        if (nearestStrongholds && nearestStrongholds.length > 0) {
          if (!nearestStrongholds.some((s) => hasLand(owner, s))) {
            const newOwner = getPlayer(gameState, getLandOwner(gameState, nearestStrongholds[0]));
            addLand(newOwner, l);

            removeLand(owner, l);
          }
        } else {
          removeLand(owner, l);
        }
      }
    });
  }
};
