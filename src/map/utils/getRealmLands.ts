import { GameState, getTurnOwner } from '../../types/GameState';
import { getLand, getLands } from './getLands';
import { BuildingType } from '../../types/Building';
import { getTilesInRadius } from './mapAlgorithms';

/** return all lands controlled by all strongholds of the player
 **/
export const getRealmLands = (gameState: GameState) => {
  return getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    buildings: [BuildingType.STRONGHOLD],
  }).flatMap((s) =>
    getTilesInRadius(gameState.battlefield.dimensions, s.mapPos, 1).map((lPos) =>
      getLand(gameState, lPos)
    )
  );
};
