import { GameState } from '../../state/GameState';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { addPlayerLand, removePlayerLand } from '../../systems/gameStateActions';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { hasArmiesAtPositionByPlayer } from '../../selectors/armySelectors';

import { BuildingType } from '../../types/Building';

import { getHostileLands } from '../utils/getHostileLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getMapDimensions } from '../../utils/screenPositionUtils';

export const changeOwner = (gameState: GameState): void => {
  // find all lands where turnOwner army is present and not controlled by the player or Ally and add them to the player's lands'
  const turnOwner = getTurnOwner(gameState);
  getHostileLands(gameState).forEach((land) =>
    Object.assign(gameState, addPlayerLand(gameState, turnOwner.id, land.mapPos))
  );

  // find lands controller by player but far from strongholds and no army
  const hostileLands = getHostileLands(gameState).filter(
    (land) => !hasArmiesAtPositionByPlayer(gameState, land.mapPos)
  );

  hostileLands.forEach((land) => {
    Object.assign(gameState, removePlayerLand(gameState, turnOwner.id, land.mapPos));
    // trying to find any other owners
    const neighbourLands = getTilesInRadius(getMapDimensions(gameState), land.mapPos, 1);
    const nearestStronghold = neighbourLands.find((l) =>
      getLand(gameState, l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
    );
    if (nearestStronghold) {
      const newLandOwnerId = getLandOwner(gameState, nearestStronghold);
      Object.assign(gameState, addPlayerLand(gameState, newLandOwnerId, land.mapPos));
    }
  });
};
