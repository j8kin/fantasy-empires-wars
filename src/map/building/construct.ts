import { BuildingType, getBuilding } from '../../types/Building';
import { getLand, LandPosition } from '../utils/getLands';
import { battlefieldLandId, GameState, getTurnOwner } from '../../types/GameState';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { NO_PLAYER } from '../../types/GamePlayer';
import { destroyBuilding } from './destroyBuilding';

export const construct = (gameState: GameState, building: BuildingType, position: LandPosition) => {
  const { battlefield } = gameState;
  const owner = getTurnOwner(gameState)!;
  const mapPosition = battlefieldLandId(position);
  if (owner.vault < getBuilding(building).buildCost) {
    return;
  }
  switch (building) {
    case BuildingType.DEMOLITION:
      destroyBuilding(position, gameState);
      break;

    case BuildingType.STRONGHOLD:
      battlefield.lands[mapPosition].buildings.push(getBuilding(building));
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
      battlefield.lands[mapPosition].buildings.push(getBuilding(building));
      break;
  }

  owner.vault -= getBuilding(building).buildCost;
};
