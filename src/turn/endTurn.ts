import { GameState } from '../types/GameState';

export const endTurn = (gameState: GameState) => {
  // change active player
  let playerIdx = gameState.players.findIndex((p) => p.id === gameState.turnOwner);
  if (playerIdx === gameState.players.length - 1) {
    playerIdx = 0;
  } else {
    playerIdx++;
  }
  gameState.turnOwner = gameState.players[playerIdx].id;
};
