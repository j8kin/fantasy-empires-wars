import { GameState } from '../../state/GameState';

import { isMoving } from '../../selectors/armySelectors';
import { getArmiesByPlayer } from '../../selectors/armySelectors';
import { moveArmy } from '../../systems/armyActions';

import { mergeArmiesAtPositions } from './mergeArmiesAtPositions';
import { updateArmyInGameState } from '../utils/armyUtils';

export const performMovements = (gameState: GameState): void => {
  const turnOwner = gameState.turnOwner;

  // Get all moving armies for the turn owner
  const movingArmies = getArmiesByPlayer(gameState, turnOwner).filter(isMoving);

  // Move each army one step forward in their path
  movingArmies.forEach((army) => {
    moveArmy(army);
    // Update the army in the GameState
    Object.assign(gameState, updateArmyInGameState(gameState, army));
  });

  // merge armies after all movements are performed
  mergeArmiesAtPositions(gameState);
};
