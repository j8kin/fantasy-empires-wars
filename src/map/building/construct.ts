import { BuildingType, getBuilding } from '../../types/Building';
import { LandPosition } from '../utils/getLands';
import { battlefieldLandId, GameState, getTurnOwner } from '../../types/GameState';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { NO_PLAYER } from '../../types/GamePlayer';
import { destroyBuilding } from './destroyBuilding';

export const construct = (gameState: GameState, building: BuildingType, position: LandPosition) => {
  const { battlefield } = gameState;
  const owner = getTurnOwner(gameState)!;
  const mapPosition = battlefieldLandId(position);
  switch (building) {
    case BuildingType.DEMOLITION:
      destroyBuilding(position, gameState);
      break;

    case BuildingType.STRONGHOLD:
      battlefield.lands[mapPosition].buildings.push(getBuilding(building));
      battlefield.lands[mapPosition].controlledBy = owner.id;
      const newLandsCandidates = getTilesInRadius(battlefield.dimensions, position, 2, true);
      for (const candidate of newLandsCandidates) {
        const currentOwner = battlefield.lands[battlefieldLandId(candidate)].controlledBy;
        if (currentOwner === NO_PLAYER.id) {
          battlefield.lands[battlefieldLandId(candidate)].controlledBy = owner.id;
        } else {
          if (battlefield.lands[battlefieldLandId(candidate)].buildings.length === 0) {
            // no buildings on the land, so we can take it if the distance is too far from the opponent stronghold
            if (
              !getTilesInRadius(battlefield.dimensions, candidate, 1).some(
                (pos) =>
                  battlefield.lands[battlefieldLandId(pos)].buildings?.some(
                    (b) => b.id === BuildingType.STRONGHOLD
                  ) && battlefield.lands[battlefieldLandId(pos)].controlledBy === currentOwner
              )
            ) {
              battlefield.lands[battlefieldLandId(candidate)].controlledBy = owner.id;
            }
          }
        }
      }
      break;

    default:
      battlefield.lands[mapPosition].buildings.push(getBuilding(building));
      break;
  }
};
