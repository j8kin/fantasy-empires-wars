import { Unit } from '../../types/Army';
import { GameState } from '../../state/GameState';
import { getLand, LandPosition } from '../../map/utils/getLands';

/**
 * test function. Should not be used in integration tests related on TurnManagement
 * @param unit
 * @param gameState
 * @param landPos
 */
export const placeUnitsOnMap = (unit: Unit, gameState: GameState, landPos: LandPosition): void => {
  getLand(gameState, landPos).army.push({ units: [unit], controlledBy: gameState.turnOwner });
};
