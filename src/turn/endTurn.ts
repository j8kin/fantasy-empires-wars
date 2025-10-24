import { GameState } from '../types/GameState';

export const endTurn = (gameState: GameState) => {
  // change active player
  const playerIdx =
    (gameState.players.findIndex((p) => p.id === gameState.turnOwner) + 1) %
    gameState.players.length;
  gameState.turnOwner = gameState.players[playerIdx].id;

  if (playerIdx === 0) {
    gameState.turn++;
  }
};
