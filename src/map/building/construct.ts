import { BuildingType, getBuilding } from '../../types/Building';
import { LandPosition } from '../utils/mapLands';
import { battlefieldLandId, GameState } from '../../types/GameState';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';
import { destroyBuilding } from '../utils/destroyBuilding';
import { getBattlefieldDimensions } from '../../types/BattlefieldSize';

export const construct = (
  owner: GamePlayer,
  building: BuildingType,
  position: LandPosition,
  gameState: GameState
) => {
  const { battlefieldLands, mapSize } = gameState;
  const dimensions = getBattlefieldDimensions(mapSize);
  const mapPosition = battlefieldLandId(position);
  switch (building) {
    case BuildingType.DEMOLITION:
      destroyBuilding(position, gameState);
      break;

    case BuildingType.STRONGHOLD:
      battlefieldLands[mapPosition].buildings.push(getBuilding(building));
      battlefieldLands[mapPosition].controlledBy = owner.id;
      const newLandsCandidates = getTilesInRadius(dimensions, position, 2, true);
      for (const candidate of newLandsCandidates) {
        const currentOwner = battlefieldLands[battlefieldLandId(candidate)].controlledBy;
        if (currentOwner === NO_PLAYER.id) {
          battlefieldLands[battlefieldLandId(candidate)].controlledBy = owner.id;
        } else {
          if (battlefieldLands[battlefieldLandId(candidate)].buildings.length === 0) {
            // no buildings on the land, so we can take it if the distance is too far from the opponent stronghold
            if (
              !getTilesInRadius(dimensions, candidate, 1).some(
                (pos) =>
                  battlefieldLands[battlefieldLandId(pos)].buildings?.some(
                    (b) => b.id === BuildingType.STRONGHOLD
                  ) && battlefieldLands[battlefieldLandId(pos)].controlledBy === currentOwner
              )
            ) {
              battlefieldLands[battlefieldLandId(candidate)].controlledBy = owner.id;
            }
          }
        }
      }
      break;

    default:
      battlefieldLands[mapPosition].buildings.push(getBuilding(building));
      break;
  }
};
