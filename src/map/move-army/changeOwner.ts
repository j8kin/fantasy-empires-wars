import { GameState } from '../../types/GameState';
import { getHostileLands } from '../utils/getHostileLands';

export const changeOwner = (gameState: GameState): void => {
  // find all lands where turnOwner army is present and not controlled by the player or Ally
  getHostileLands(gameState).forEach((land) => {
    land.controlledBy = gameState.turnOwner;
  });
};
