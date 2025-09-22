import { BUILDING_TYPES, BuildingType } from '../../types/Building';
import { Position } from '../utils/mapTypes';
import { createTileId, HexTileState } from '../../types/HexTileState';
import { calculateHexDistance, getTilesInRadius } from '../utils/mapAlgorithms';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { NEUTRAL_PLAYER, Player } from '../../types/Player';

export const construct = (
  owner: Player,
  building: BuildingType,
  position: Position,
  tiles: { [key: string]: HexTileState },
  mapSize: BattlefieldSize
) => {
  const mapPosition = createTileId(position);
  if (building !== 'stronghold') {
    tiles[mapPosition].buildings.push(BUILDING_TYPES[building]);
  } else {
    tiles[mapPosition].buildings.push(BUILDING_TYPES[building]);
    tiles[mapPosition].controlledBy = owner;
    const newLandsCandidates = getTilesInRadius(mapSize, position, 2, true);
    for (const candidate of newLandsCandidates) {
      const currentOwner = tiles[createTileId(candidate)].controlledBy;
      if (currentOwner.id === owner.id) continue;
      if (currentOwner.id === NEUTRAL_PLAYER.id) {
        tiles[createTileId(candidate)].controlledBy = owner;
      } else {
        // compare which stronghold is nearest
        const newStrongholdDistance = calculateHexDistance(mapSize, position, candidate);
        const oldOwnerStrongholds = getTilesInRadius(mapSize, candidate, 2)
          .map((t) => tiles[createTileId(t)])
          .filter(
            (t) =>
              t.controlledBy.id === currentOwner.id &&
              t.buildings.some((b) => b.type === 'stronghold')
          );
        const oldOwnerDistance = oldOwnerStrongholds
          .map((t) => calculateHexDistance(mapSize, position, t))
          .reduce((a, b) => Math.min(a, b), Infinity);
        if (newStrongholdDistance < oldOwnerDistance) {
          tiles[createTileId(candidate)].controlledBy = owner;
        }
      }
    }
  }
};
