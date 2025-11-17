import { battlefieldLandId, GameState } from '../../types/GameState';
import { getHostileLands } from '../utils/getHostileLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getLand, getLands } from '../utils/getLands';
import { BuildingType } from '../../types/Building';
import { NO_PLAYER } from '../../types/GamePlayer';
import { getRealmLands } from '../utils/getRealmLands';

export const changeOwner = (gameState: GameState): void => {
  // find all lands where turnOwner army is present and not controlled by the player or Ally
  getHostileLands(gameState).forEach((land) => (land.controlledBy = gameState.turnOwner));

  // find lands controller by player but far from strongholds and no army
  const realmLands = getRealmLands(gameState).map((l) => battlefieldLandId(l.mapPos));

  getLands({
    gameState: gameState,
    players: [gameState.turnOwner],
    noArmy: true,
  })
    .filter(
      (l) =>
        !realmLands.includes(battlefieldLandId(l.mapPos)) &&
        !l.army.some((a) => a.controlledBy === gameState.turnOwner)
    )
    .forEach((hostileLand) => {
      if (hostileLand.army.length > 0) {
        hostileLand.controlledBy = hostileLand.army[0].controlledBy;
      } else {
        // army destroyed return to previous owner or set to neutral
        const neighbourLands = getTilesInRadius(
          gameState.battlefield.dimensions,
          hostileLand.mapPos,
          1
        );
        const previousOwner = neighbourLands.find((l) =>
          getLand(gameState, l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
        );
        if (previousOwner) {
          hostileLand.controlledBy = getLand(gameState, previousOwner).controlledBy;
        } else {
          hostileLand.controlledBy = NO_PLAYER.id;
        }
      }
    });
};
