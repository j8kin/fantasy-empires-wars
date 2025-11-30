import { GameState } from '../../state/GameState';
import { addArmyToGameState } from '../../map/utils/armyUtils';

import { Unit } from '../../types/BaseUnit';
import { isHeroType } from '../../types/UnitType';
import { HeroState } from '../../state/army/HeroState';
import { RegularsState } from '../../state/army/RegularsState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { armyFactory } from '../../factories/armyFactory';

/**
 * test function. Should not be used in integration tests related on TurnManagement
 * @param unit
 * @param gameState
 * @param landPos
 */
export const placeUnitsOnMap = (unit: Unit, gameState: GameState, landPos: LandPosition): void => {
  let newArmy;
  if (isHeroType(unit.type)) {
    newArmy = armyFactory(gameState.turnOwner, landPos, [unit as HeroState]);
  } else {
    newArmy = armyFactory(gameState.turnOwner, landPos, undefined, [unit as RegularsState]);
  }
  Object.assign(gameState, addArmyToGameState(gameState, newArmy));
};
