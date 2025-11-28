import { GameState } from '../../state/GameState';
import { getLand } from '../../selectors/landSelectors';

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
  if (isHeroType(unit.type)) {
    getLand(gameState, landPos).army.push(
      armyFactory(gameState.turnOwner, landPos, [unit as HeroState])
    );
  } else {
    getLand(gameState, landPos).army.push(
      armyFactory(gameState.turnOwner, landPos, undefined, [unit as RegularsState])
    );
  }
};
