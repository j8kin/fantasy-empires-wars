import { getTurnOwner, hasTreasureByPlayer, isPlayerDoctrine } from '../../selectors/playerSelectors';
import { getLandOwner, getTilesInRadius } from '../../selectors/landSelectors';
import { isWarsmithPresent } from '../../selectors/armySelectors';
import { addBuildingToLand, addPlayerLand, updatePlayerVault } from '../../systems/gameStateActions';
import { buildingFactory } from '../../factories/buildingFactory';
import { getBuildingInfo } from '../../domain/building/buildingRepository';
import { destroyBuilding } from './destroyBuilding';
import { Doctrine } from '../../state/player/PlayerProfile';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import { TreasureName } from '../../types/Treasures';
import { BuildingName } from '../../types/Building';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { BuildingType } from '../../types/Building';

export const construct = (gameState: GameState, buildingType: BuildingType, position: LandPosition) => {
  const map = gameState.map;
  const turnOwner = getTurnOwner(gameState);
  const building = getBuildingInfo(buildingType);

  // while game is not started (turn === 1) it should be possible to build any building on any land
  if (gameState.turn > 1) {
    if (turnOwner.vault < building.buildCost) {
      return;
    }
    // For DRIVEN Doctrine building could be created only if WARSMITH is present on Land
    if (isPlayerDoctrine(gameState, Doctrine.DRIVEN) && !isWarsmithPresent(gameState, position)) {
      return;
    }
  }

  // Accumulate all state changes
  let updatedState = gameState;

  switch (buildingType) {
    case BuildingName.DEMOLITION:
      updatedState = destroyBuilding(updatedState, position);
      break;

    case BuildingName.STRONGHOLD:
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
  const hasCrownOfDominion = hasTreasureByPlayer(turnOwner, TreasureName.CROWN_OF_DOMINION);

  if (gameState.turn > 1) {
    const cost = hasCrownOfDominion ? Math.ceil(building.buildCost * 0.85) : building.buildCost;
    updatedState = updatePlayerVault(updatedState, turnOwner.id, -cost);
  }

  // Apply all accumulated changes in one place
  Object.assign(gameState, updatedState);
};
