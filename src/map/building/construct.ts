import { BuildingType, getBuilding } from '../../types/Building';
import { LandPosition } from '../utils/mapLands';
import { battlefieldLandId, BattlefieldLands } from '../../types/GameState';
import { calculateHexDistance, getTilesInRadius } from '../utils/mapAlgorithms';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';

export const construct = (
  owner: GamePlayer,
  building: BuildingType,
  position: LandPosition,
  tiles: BattlefieldLands,
  mapSize: BattlefieldSize
) => {
  const mapPosition = battlefieldLandId(position);
  if (building !== BuildingType.STRONGHOLD) {
    tiles[mapPosition].buildings.push(getBuilding(building));
  } else {
    tiles[mapPosition].buildings.push(getBuilding(building));
    tiles[mapPosition].controlledBy = owner.id;
    const newLandsCandidates = getTilesInRadius(mapSize, position, 2, true);
    for (const candidate of newLandsCandidates) {
      const currentOwner = tiles[battlefieldLandId(candidate)].controlledBy;
      if (currentOwner === NO_PLAYER.id) {
        tiles[battlefieldLandId(candidate)].controlledBy = owner.id;
      } else {
        if (tiles[battlefieldLandId(candidate)].buildings.length === 0) {
          // no buildings on the land, so we can take it if the distance is too far from the opponent stronghold
          if (
            !getTilesInRadius(mapSize, candidate, 1).some(
              (pos) =>
                tiles[battlefieldLandId(pos)].buildings?.some(
                  (b) => b.id === BuildingType.STRONGHOLD
                ) && tiles[battlefieldLandId(pos)].controlledBy === currentOwner
            )
          ) {
            tiles[battlefieldLandId(candidate)].controlledBy = owner.id;
          }
        }
      }
    }
  }
};
