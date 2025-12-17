import { GameState } from '../../state/GameState';

import { getArmiesByPlayer, getPosition, isMoving } from '../../selectors/armySelectors';
import { getLand, hasActiveEffect } from '../../selectors/landSelectors';
import { moveArmy, updateArmyInGameState } from '../../systems/armyActions';

import { SpellName } from '../../types/Spell';
import { mergeArmiesAtPositions } from './mergeArmiesAtPositions';

export const performMovements = (gameState: GameState): GameState => {
  const turnOwner = gameState.turnOwner;

  // Get all moving armies for the turn owner
  const movingArmies = getArmiesByPlayer(gameState, turnOwner).filter(
    (army) =>
      isMoving(army) &&
      !hasActiveEffect(getLand(gameState, getPosition(army)), SpellName.ENTANGLING_ROOTS)
  );

  let updatedState = gameState;

  // Move each army one step forward in their path
  movingArmies.forEach((army) => {
    moveArmy(army);
    // Update the army in the GameState
    updatedState = updateArmyInGameState(updatedState, army);
  });

  // merge armies after all movements are performed
  mergeArmiesAtPositions(updatedState);

  return updatedState;
};
