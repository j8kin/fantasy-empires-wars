import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/LandState';

import { Unit } from '../../types/RegularUnit';

/**
 * test function. Should not be used in integration tests related on TurnManagement
 * @param unit
 * @param gameState
 * @param landPos
 */
export const placeUnitsOnMap = (unit: Unit, gameState: GameState, landPos: LandPosition): void => {
  gameState.getLand(landPos).army.push({ units: [unit], controlledBy: gameState.turnOwner.id });
};
