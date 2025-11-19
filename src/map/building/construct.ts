import { BuildingType, getBuilding } from '../../types/Building';
import { getLand, LandPosition } from '../utils/getLands';
import { battlefieldLandId, GameState, getTurnOwner } from '../../types/GameState';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { NO_PLAYER } from '../../types/GamePlayer';
import { destroyBuilding } from './destroyBuilding';
import { TreasureItem } from '../../types/Treasures';

export const construct = (
  gameState: GameState,
  buildingType: BuildingType,
  position: LandPosition
) => {
  const { battlefield } = gameState;
  const owner = getTurnOwner(gameState)!;
  const mapPosition = battlefieldLandId(position);
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
      battlefield.lands[mapPosition].controlledBy = owner.id;
      const newLandsCandidates = getTilesInRadius(battlefield.dimensions, position, 1, true);
      newLandsCandidates.forEach((land) => {
        // if the land is not controlled by any player, it becomes controlled by the player
        if (getLand(gameState, land).controlledBy === NO_PLAYER.id) {
          battlefield.lands[battlefieldLandId(land)].controlledBy = owner.id;
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
};
