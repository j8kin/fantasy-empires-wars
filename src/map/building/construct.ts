import { GameState, getTurnOwner } from '../../state/GameState';
import { getLandId, LandPosition } from '../../state/LandState';
import { NO_PLAYER } from '../../state/PlayerState';

import { TreasureItem } from '../../types/Treasures';
import { BuildingType, getBuilding } from '../../types/Building';

import { getLand } from '../utils/getLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';

import { destroyBuilding } from './destroyBuilding';

export const construct = (
  gameState: GameState,
  buildingType: BuildingType,
  position: LandPosition
) => {
  const { battlefield } = gameState;
  const owner = getTurnOwner(gameState)!;
  const mapPosition = getLandId(position);
  const building = getBuilding(buildingType);
  if (owner.vault < building.buildCost) {
    return;
  }
  switch (buildingType) {
    case BuildingType.DEMOLITION:
      destroyBuilding(position, gameState);
      break;

    case BuildingType.STRONGHOLD:
      battlefield.lands[mapPosition].buildings.push(building);
      battlefield.lands[mapPosition].controlledBy = owner.playerId;
      const newLandsCandidates = getTilesInRadius(battlefield.dimensions, position, 1, true);
      newLandsCandidates.forEach((land) => {
        // if the land is not controlled by any player, it becomes controlled by the player
        if (getLand(gameState, land).controlledBy === NO_PLAYER.id) {
          battlefield.lands[getLandId(land)].controlledBy = owner.playerId;
        }
      });
      break;

    default:
      battlefield.lands[mapPosition].buildings.push(building);
      break;
  }

  // if player has Crown of Dominion, reduce cost by 15%
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasCrownOfDominion = owner.empireTreasures?.some(
    (t) => t.id === TreasureItem.CROWN_OF_DOMINION
  );

  owner.vault -= hasCrownOfDominion ? Math.ceil(building.buildCost * 0.85) : building.buildCost;
  if (gameState.turn > 1) {
    // on the first turn default buildings are constructed without maintaining them since the real game starts at turn 2
    owner.income -= building.maintainCost;
  }
};
