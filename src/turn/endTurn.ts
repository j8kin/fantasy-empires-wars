import { nextPlayer } from '../systems/playerActions';
import { performMovements } from '../map/move-army/performMovements';
import { changeOwner } from '../map/move-army/changeOwner';
import type { GameState } from '../state/GameState';

export const endTurn = (gameState: GameState) => {
  // complete movements
  Object.assign(gameState, performMovements(gameState));

  // Battle todo [Issue #61]
  // https://github.com/j8kin/fantasy-empires-wars/issues/61

  // Change Land owner due to battle or unit movement
  changeOwner(gameState);

  // change active player
  nextPlayer(gameState);
};
