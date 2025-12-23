import {
  getHostileLands,
  getLand,
  getLandOwner,
  getTilesInRadius,
} from '../../selectors/landSelectors';
import { addPlayerLand, removeLandEffect, removePlayerLand } from '../../systems/gameStateActions';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { hasArmiesAtPositionByPlayer } from '../../selectors/armySelectors';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import { BuildingKind } from '../../types/Building';
import { TreasureName } from '../../types/Treasures';

import type { GameState } from '../../state/GameState';

export const changeOwner = (gameState: GameState): void => {
  const turnOwner = getTurnOwner(gameState);
  let updatedState = gameState;

  // find all lands where turnOwner army is present and not controlled by the player or Ally and add them to the player's lands'
  getHostileLands(gameState).forEach((land) => {
    const prevOwner = getLandOwner(updatedState, land.mapPos);
    if (prevOwner !== turnOwner.id && prevOwner !== NO_PLAYER.id) {
      updatedState = removePlayerLand(updatedState, prevOwner, land.mapPos);
      const deedOfReclamation = land.effects.find(
        (e) => e.sourceId === TreasureName.DEED_OF_RECLAMATION
      );
      if (deedOfReclamation != null) {
        updatedState = removeLandEffect(updatedState, land.mapPos, deedOfReclamation.id);
      }
    }
    updatedState = addPlayerLand(updatedState, turnOwner.id, land.mapPos);
  });

  // find lands controlled by player but far from strongholds and no army
  const hostileLands = getHostileLands(updatedState).filter(
    (land) => !hasArmiesAtPositionByPlayer(updatedState, land.mapPos)
  );

  hostileLands.forEach((land) => {
    updatedState = removePlayerLand(updatedState, turnOwner.id, land.mapPos);

    // trying to find any other owners
    const neighbourLands = getTilesInRadius(getMapDimensions(updatedState), land.mapPos, 1);
    const nearestStronghold = neighbourLands.find((l) =>
      getLand(updatedState, l).buildings?.some((b) => b.type === BuildingKind.STRONGHOLD)
    );
    if (nearestStronghold) {
      const newLandOwnerId = getLandOwner(updatedState, nearestStronghold);
      updatedState = addPlayerLand(updatedState, newLandOwnerId, land.mapPos);
    }
  });

  // Single point of mutation
  Object.assign(gameState, updatedState);
};
