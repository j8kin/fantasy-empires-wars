import { BUILDING_TYPES, BuildingType } from '../../types/Building';
import { Position } from '../utils/mapTypes';
import { createTileId, HexTileState } from '../../types/HexTileState';
import { calculateHexDistance, getTilesInRadius } from '../utils/mapAlgorithms';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';

export const construct = (
  owner: GamePlayer,
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
    tiles[mapPosition].controlledBy = owner.id;
    const newLandsCandidates = getTilesInRadius(mapSize, position, 2, true);
    for (const candidate of newLandsCandidates) {
      const currentOwner = tiles[createTileId(candidate)].controlledBy;
      if (currentOwner === owner.id) continue;
      if (currentOwner === NO_PLAYER.id) {
        tiles[createTileId(candidate)].controlledBy = owner.id;
      } else {
        // compare which stronghold is nearest
        const newStrongholdDistance = calculateHexDistance(mapSize, position, candidate);
        const oldOwnerStrongholds = getTilesInRadius(mapSize, candidate, 2)
          .map((t) => tiles[createTileId(t)])
          .filter(
            (t) =>
              t.controlledBy === currentOwner && t.buildings.some((b) => b.type === 'stronghold')
          );
        const oldOwnerDistance = oldOwnerStrongholds
          .map((t) => calculateHexDistance(mapSize, position, t.mapPos))
          .reduce((a, b) => Math.min(a, b), Infinity);
        if (newStrongholdDistance < oldOwnerDistance) {
          tiles[createTileId(candidate)].controlledBy = owner.id;
        }
      }
    }
  }
};
