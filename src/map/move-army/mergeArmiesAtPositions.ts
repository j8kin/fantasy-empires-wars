import {
  getPosition,
  isMoving,
  getArmiesAtPosition,
  getArmiesByPlayer,
} from '../../selectors/armySelectors';
import { mergeArmies } from '../../systems/armyActions';
import { removeArmyFromGameState, updateArmyInGameState } from '../../systems/armyActions';

import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';

export const mergeArmiesAtPositions = (gameState: GameState): void => {
  const turnOwner = gameState.turnOwner;

  // Get all lands owned by turn owner
  const uniqLands = new Set<LandPosition>();
  getArmiesByPlayer(gameState, turnOwner).forEach((a) => uniqLands.add(getPosition(a)));
  uniqLands.forEach((l) => {
    const armiesAtLand = getArmiesAtPosition(gameState, l).filter(
      (a) => !isMoving(a) && a.controlledBy === turnOwner
    );
    if (armiesAtLand.length < 2) return;
    let mainArmy = armiesAtLand.pop()!;
    armiesAtLand.forEach((armyToMerge) => {
      mainArmy = mergeArmies(mainArmy, armyToMerge);
      // Remove the merged army from GameState
      Object.assign(gameState, removeArmyFromGameState(gameState, armyToMerge.id));
    });
    // Update the main army in GameState
    Object.assign(gameState, updateArmyInGameState(gameState, mainArmy));
  });
};
