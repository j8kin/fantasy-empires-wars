import { GameState } from '../../state/GameState';
import { getLand, getLands } from './getLands';
import { BuildingType } from '../../types/Building';
import { getTilesInRadius } from './mapAlgorithms';

/** return all lands controlled by all strongholds of the player
 **/
export const getRealmLands = (gameState: GameState) => {
  return getLands({
    gameState: gameState,
    players: [gameState.turnOwner.id],
    buildings: [BuildingType.STRONGHOLD],
  }).flatMap((s) =>
    getTilesInRadius(gameState.map.dimensions, s.mapPos, 1).map((lPos) => getLand(gameState, lPos))
  );
};
