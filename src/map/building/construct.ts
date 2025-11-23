import { GameState } from '../../state/GameState';
import { getLandId, LandPosition } from '../../state/LandState';

import { TreasureItem } from '../../types/Treasures';
import { BuildingType, getBuilding } from '../../types/Building';

import { getTilesInRadius } from '../utils/mapAlgorithms';

import { destroyBuilding } from './destroyBuilding';
import { NO_PLAYER } from '../../state/PlayerState';

export const construct = (
  gameState: GameState,
  buildingType: BuildingType,
  position: LandPosition
) => {
  const map = gameState.map;
  const owner = gameState.turnOwner;
  const mapPosition = getLandId(position);
  const building = getBuilding(buildingType);
  if (owner.vault < building.buildCost && gameState.turn > 1) {
    return;
  }
  switch (buildingType) {
    case BuildingType.DEMOLITION:
      destroyBuilding(position, gameState);
      break;

    case BuildingType.STRONGHOLD:
      map.lands[mapPosition].buildings.push(building);
      owner.addLand(mapPosition);
      const newLandsCandidates = getTilesInRadius(map.dimensions, position, 1, true);
      newLandsCandidates.forEach((land) => {
        // if the land is not controlled by any player, it becomes controlled by the player
        if (gameState.getLandOwner(getLandId(land)) === NO_PLAYER.id) {
          owner.addLand(getLandId(land));
        }
      });
      break;

    default:
      map.lands[mapPosition].buildings.push(building);
      break;
  }

  // if player has Crown of Dominion, reduce cost by 15%
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasCrownOfDominion = owner.empireTreasures?.some(
    (t) => t.id === TreasureItem.CROWN_OF_DOMINION
  );

  if (gameState.turn > 1) {
    owner.vault -= hasCrownOfDominion ? Math.ceil(building.buildCost * 0.85) : building.buildCost;
  }
};
