import { GameState } from '../state/GameState';
import { performMovements } from '../map/move-army/performMovements';
import { changeOwner } from '../map/move-army/changeOwner';

export const endTurn = (gameState: GameState) => {
  // complete movements
  performMovements(gameState);

  // Battle todo [Issue #61]
  // https://github.com/j8kin/fantasy-empires-wars/issues/61

  // Change Land owner due to battle or unit movement
  changeOwner(gameState);

  // change active player
  const playerIdx =
    (gameState.players.findIndex((p) => p.playerId === gameState.turnOwner) + 1) %
    gameState.players.length;
  gameState.turnOwner = gameState.players[playerIdx].playerId;

  if (playerIdx === 0) {
    gameState.turn++;
  }
};
