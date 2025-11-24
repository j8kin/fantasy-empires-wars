import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/LandState';

import { BuildingType } from '../../types/Building';

import { getHostileLands } from '../utils/getHostileLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getLands } from '../utils/getLands';
import { getRealmLands } from '../utils/getRealmLands';

export const changeOwner = (gameState: GameState): void => {
  // find all lands where turnOwner army is present and not controlled by the player or Ally
  const turnOwner = gameState.turnOwner;
  const hostileLands = getHostileLands(gameState);
  hostileLands.forEach((land) => turnOwner.addLand(getLandId(land.mapPos)));

  // find lands controller by player but far from strongholds and no army
  const realmLands = getRealmLands(gameState).map((l) => getLandId(l.mapPos));
  const allControlledLands = getLands({
    // todo replace with turnOwner.getAllLands();
    gameState: gameState,
    players: [gameState.turnOwner.id],
    noArmy: true,
  });

  allControlledLands
    .filter((l) => !realmLands.includes(getLandId(l.mapPos)))
    .forEach((land) => {
      const landPos = getLandId(land.mapPos);
      turnOwner.removeLand(landPos);
      // trying to find any other owners
      const neighbourLands = getTilesInRadius(gameState.map.dimensions, land.mapPos, 1);
      const nearestStronghold = neighbourLands.find((l) =>
        gameState.getLand(l).buildings?.some((b) => b.id === BuildingType.STRONGHOLD)
      );
      if (nearestStronghold) {
        const newLandOwner = gameState.getLandOwner(nearestStronghold);
        gameState.getPlayer(newLandOwner).addLand(landPos);
      }
    });
};
