import { getArmiesByPlayer, getPosition, isMoving } from '../../selectors/armySelectors';
import { getLand, hasActiveEffect } from '../../selectors/landSelectors';
import { moveArmy, updateArmyInGameState } from '../../systems/armyActions';
import { mergeArmiesAtPositions } from './mergeArmiesAtPositions';

import { SpellName } from '../../types/Spell';
import { TreasureType } from '../../types/Treasures';
import type { GameState } from '../../state/GameState';

export const performMovements = (state: GameState): GameState => {
  const turnOwner = state.turnOwner;

  // Get all moving armies for the turn owner
  const movingArmies = getArmiesByPlayer(state, turnOwner).filter(
    (army) =>
      isMoving(army) &&
      !hasActiveEffect(getLand(state, getPosition(army)), SpellName.ENTANGLING_ROOTS) &&
      !hasActiveEffect(getLand(state, getPosition(army)), TreasureType.HOURGLASS_OF_DELAY)
  );

  let updatedState = state;

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
