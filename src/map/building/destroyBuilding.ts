import { getLandId, GameState } from '../../state/GameState';
import { BuildingType } from '../../types/Building';
import { getNearestStrongholdLand, getTilesInRadius } from '../utils/mapAlgorithms';
import { NO_PLAYER } from '../../state/PlayerState';
import { LandPosition } from '../utils/getLands';

/**
 * Player could destroy the building as Demolition before construction of a new one
 * it could be destroyed in the battle or by spell from the player opponent
 * @param landPos - identify the land where building should be destroyed
 * @param gameState - Game State (income and player lands could be updated)
 */
export const destroyBuilding = (landPos: LandPosition, gameState: GameState) => {
  const landId = getLandId(landPos);
  const player = gameState.battlefield.lands[landId].controlledBy;
  const isStronghold = gameState.battlefield.lands[landId].buildings.some(
    (b) => b.id === BuildingType.STRONGHOLD
  );

  gameState.battlefield.lands[landId].buildings = []; // delete all buildings since only one could be on the land (todo: think about WALL it could be an additional building for now destroy all)

  if (isStronghold) {
    // if stronghold destroyed then all Lands in radius two should be neutral or could be taken under control by another player
    // if there is an amy on the land not change the owner
    getTilesInRadius(
      gameState.battlefield.dimensions,
      gameState.battlefield.lands[landId].mapPos,
      1,
      false
    )
      .map(getLandId)
      .filter(
        (l) =>
          gameState.battlefield.lands[l].controlledBy === player &&
          gameState.battlefield.lands[l].army.length === 0 &&
          !gameState.battlefield.lands[l].buildings.some((b) => b.id === BuildingType.STRONGHOLD)
      )
      .forEach(
        (land) =>
          (gameState.battlefield.lands[land].controlledBy =
            getNearestStrongholdLand(gameState.battlefield.lands[land].mapPos, gameState)
              ?.controlledBy ?? NO_PLAYER.id)
      );
  }
};
