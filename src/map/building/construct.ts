import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { getLandOwner, getTilesInRadius } from '../../selectors/landSelectors';
import { buildingFactory } from '../../factories/buildingFactory';
import { getBuilding } from '../../domain/building/buildingRepository';
import {
  addBuildingToLand,
  addPlayerLand,
  updatePlayerVault,
} from '../../systems/gameStateActions';
import { destroyBuilding } from './destroyBuilding';
import { NO_PLAYER } from '../../domain/player/playerRepository';

import { TreasureType } from '../../types/Treasures';
import { BuildingType } from '../../types/Building';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';

export const construct = (
  gameState: GameState,
  buildingType: BuildingType,
  position: LandPosition
) => {
  const map = gameState.map;
  const turnOwner = getTurnOwner(gameState);
  const building = getBuilding(buildingType);
  if (turnOwner.vault < building.buildCost && gameState.turn > 1) {
    return;
  }

  // Accumulate all state changes
  let updatedState = gameState;

  switch (buildingType) {
    case BuildingType.DEMOLITION:
      updatedState = destroyBuilding(updatedState, position);
      break;

    case BuildingType.STRONGHOLD:
      updatedState = addBuildingToLand(updatedState, position, buildingFactory(buildingType));
      updatedState = addPlayerLand(updatedState, turnOwner.id, position);

      const newLandsCandidates = getTilesInRadius(map.dimensions, position, 1, true);
      newLandsCandidates.forEach((land) => {
        // if the land is not controlled by any player, it becomes controlled by the player
        if (getLandOwner(updatedState, land) === NO_PLAYER.id) {
          updatedState = addPlayerLand(updatedState, turnOwner.id, land);
        }
      });
      break;

    default:
      updatedState = addBuildingToLand(updatedState, position, buildingFactory(buildingType));
      break;
  }

  // if player has Crown of Dominion, reduce cost by 15%
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes'-Quests
  const hasCrownOfDominion = hasTreasureByPlayer(turnOwner, TreasureType.CROWN_OF_DOMINION);

  if (gameState.turn > 1) {
    const cost = hasCrownOfDominion ? Math.ceil(building.buildCost * 0.85) : building.buildCost;
    updatedState = updatePlayerVault(updatedState, turnOwner.id, -cost);
  }

  // Apply all accumulated changes in one place
  Object.assign(gameState, updatedState);
};
