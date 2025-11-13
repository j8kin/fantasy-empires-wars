import { GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { getLands } from '../utils/getLands';

export const completeMovements = (gameState: GameState): void => {
  if (gameState == null || gameState.turnPhase === TurnPhase.MAIN) return;

  const player = getTurnOwner(gameState)!;
  getLands({ lands: gameState.battlefield.lands, players: [player], noArmy: false }).forEach(
    (land) => {
      land.army
        .filter((a) => a.movements != null && a.controlledBy === gameState.turnOwner)
        .forEach((a) => {
          // if units are reach the destination, remove the movement
          if (a.movements?.to === land.mapPos) {
            a.movements = undefined;
          }
        });
    }
  );
};
