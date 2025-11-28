import { GameState } from '../../state/GameState';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { addLand, removeLand } from '../../systems/playerActions';
import { getPlayer, getTurnOwner } from '../../selectors/playerSelectors';

import { BuildingType } from '../../types/Building';

import { getHostileLands } from '../utils/getHostileLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getLands } from '../utils/getLands';
import { getRealmLands } from '../utils/getRealmLands';
import { getLandId } from '../../state/map/land/LandId';

export const changeOwner = (gameState: GameState): void => {
  // find all lands where turnOwner army is present and not controlled by the player or Ally
  const turnOwner = getTurnOwner(gameState);
  const hostileLands = getHostileLands(gameState);
  hostileLands.forEach((land) => addLand(turnOwner, land.mapPos));

  // find lands controller by player but far from strongholds and no army
  const realmLands = getRealmLands(gameState).map((l) => getLandId(l.mapPos));
  const allControlledLands = getLands({
    // todo replace with turnOwner.getAllLands();
    gameState: gameState,
    players: [getTurnOwner(gameState).id],
    noArmy: true,
  });

  allControlledLands
    .filter((l) => !realmLands.includes(getLandId(l.mapPos)))
    .forEach((land) => {
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
