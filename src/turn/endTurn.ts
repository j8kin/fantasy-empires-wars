import { GameState } from '../types/GameState';

export const endTurn = (gameState: GameState) => {
  // change active player
  let playerIdx = gameState.players.findIndex((p) => p.id === gameState.turnOwner);
  const wasLastPlayer = playerIdx === gameState.players.length - 1;

  if (wasLastPlayer) {
    playerIdx = 0;
    gameState.turn++; // Increment turn counter when cycling back to first player
  } else {
    playerIdx++;
  }
  gameState.turnOwner = gameState.players[playerIdx].id;
};
