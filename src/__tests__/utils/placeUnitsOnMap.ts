import { GameState } from '../../state/GameState';
import { HeroState } from '../../state/army/HeroState';
import { RegularsState } from '../../state/army/RegularsState';
import { LandPosition } from '../../state/map/land/LandPosition';

import { armyFactory } from '../../factories/armyFactory';

import { isHeroType } from '../../domain/unit/unitTypeChecks';
import { Unit } from '../../types/BaseUnit';

import { addArmyToGameState } from '../../systems/armyActions';

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
