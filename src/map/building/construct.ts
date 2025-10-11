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
        // compare which stronghold is nearest
        const newStrongholdDistance = calculateHexDistance(mapSize, position, candidate);
        const oldOwnerStrongholds = getTilesInRadius(mapSize, candidate, 2)
          .map((t) => tiles[battlefieldLandId(t)])
          .filter(
            (t) =>
              t.controlledBy === currentOwner &&
              t.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
          );
        const oldOwnerDistance = oldOwnerStrongholds
          .map((t) => calculateHexDistance(mapSize, position, t.mapPos))
          .reduce((a, b) => Math.min(a, b), Infinity);
        if (
          newStrongholdDistance < oldOwnerDistance &&
          tiles[battlefieldLandId(candidate)].buildings.length === 0
        ) {
          tiles[battlefieldLandId(candidate)].controlledBy = owner.id;
        }
      }
    }
  }
};
