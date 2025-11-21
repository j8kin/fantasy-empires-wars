import { GameState, getLandOwner, getPlayerById, getTurnOwner } from '../../state/GameState';
import { getLandId, LandPosition } from '../../state/LandState';

import { BuildingType } from '../../types/Building';

import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getLand } from '../utils/getLands';

/**
 * Player could destroy the building as Demolition before construction of a new one
 * it could be destroyed in the battle or by spell from the player opponent
 * @param landPos - identify the land where building should be destroyed
 * @param gameState - Game State (income and player lands could be updated)
 */
export const destroyBuilding = (landPos: LandPosition, gameState: GameState) => {
  const landId = getLandId(landPos);
  const player = getLandOwner(gameState, landId);
  const isStronghold = gameState.battlefield.lands[landId].buildings.some(
    (b) => b.id === BuildingType.STRONGHOLD
  );

  gameState.battlefield.lands[landId].buildings = []; // delete all buildings since only one could be on the land (todo: think about WALL it could be an additional building for now destroy all)

  if (isStronghold) {
    // if stronghold destroyed then all Lands in radius one should be neutral or could be taken under control by another player
    // if there is an amy on the land not change the owner
    const previousControlledLands = getTilesInRadius(
      gameState.battlefield.dimensions,
      gameState.battlefield.lands[landId].mapPos,
      1,
      false
    );

    previousControlledLands.forEach((l) => {
      const owner = getTurnOwner(gameState)!;
      if (gameState.battlefield.lands[getLandId(l)].army.length > 0) {
        // if land has army of non-previous owner then change for a new owner (who owns army on this land)
        if (
          !gameState.battlefield.lands[getLandId(l)].army.some((a) => a.controlledBy === player)
        ) {
          owner.removeLand(getLandId(l));
          const newLandOwner = getPlayerById(
            gameState,
            gameState.battlefield.lands[getLandId(l)].army[0].controlledBy
          )!;
          newLandOwner.addLand(getLandId(l));
        }
      } else {
        // no army look for nearest stronghold
        const nearestStrongholds = getTilesInRadius(gameState.battlefield.dimensions, l, 1).filter(
          (l) => getLand(gameState, l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
        );
        if (nearestStrongholds && nearestStrongholds.length > 0) {
          if (!nearestStrongholds.some((s) => owner.hasLand(getLandId(s)))) {
            const newOwner = getLandOwner(gameState, getLandId(nearestStrongholds[0]));
            getPlayerById(gameState, newOwner)!.addLand(getLandId(l));

            owner.removeLand(getLandId(l));
          }
        } else {
          owner.removeLand(getLandId(l));
        }
      }
    });
  }
};
