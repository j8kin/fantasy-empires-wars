import { GameState } from '../../state/GameState';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { addLand, removeLand } from '../../systems/playerActions';
import { getPlayer, getTurnOwner } from '../../selectors/playerSelectors';
import { hasArmiesAtPositionByPlayer } from '../utils/armyUtils';

import { BuildingType } from '../../types/Building';

import { getHostileLands } from '../utils/getHostileLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';

export const changeOwner = (gameState: GameState): void => {
  // find all lands where turnOwner army is present and not controlled by the player or Ally and add them to the player's lands'
  const turnOwner = getTurnOwner(gameState);
  getHostileLands(gameState).forEach((land) => addLand(turnOwner, land.mapPos));

  // find lands controller by player but far from strongholds and no army
  const hostileLands = getHostileLands(gameState).filter(
    (land) => !hasArmiesAtPositionByPlayer(gameState, land.mapPos)
  );

  hostileLands.forEach((land) => {
    removeLand(turnOwner, land.mapPos);
    // trying to find any other owners
    const neighbourLands = getTilesInRadius(gameState.map.dimensions, land.mapPos, 1);
    const nearestStronghold = neighbourLands.find((l) =>
      getLand(gameState, l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
    );
    if (nearestStronghold) {
      const newLandOwner = getPlayer(gameState, getLandOwner(gameState, nearestStronghold));
      addLand(newLandOwner, land.mapPos);
    }
  });
};
