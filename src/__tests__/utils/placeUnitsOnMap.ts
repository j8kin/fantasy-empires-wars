import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/LandState';
import { Unit } from '../../types/BaseUnit';
import { isHeroType } from '../../types/UnitType';
import { createArmy } from '../../types/Army';
import { HeroUnit } from '../../types/HeroUnit';
import { RegularUnit } from '../../types/RegularUnit';

/**
 * test function. Should not be used in integration tests related on TurnManagement
 * @param unit
 * @param gameState
 * @param landPos
 */
export const placeUnitsOnMap = (unit: Unit, gameState: GameState, landPos: LandPosition): void => {
  if (isHeroType(unit.id)) {
    gameState
      .getLand(landPos)
      .army.push(createArmy(gameState.turnOwner.id, landPos, [unit as HeroUnit]));
  } else {
    gameState
      .getLand(landPos)
      .army.push(createArmy(gameState.turnOwner.id, landPos, undefined, [unit as RegularUnit]));
  }
};
