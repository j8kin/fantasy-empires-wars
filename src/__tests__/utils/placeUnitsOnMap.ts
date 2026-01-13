import { armyFactory } from '../../factories/armyFactory';
import { isHeroType, isWarMachine } from '../../domain/unit/unitTypeChecks';
import { addArmyToGameState } from '../../systems/armyActions';

import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { HeroState } from '../../state/army/HeroState';
import type { RegularsState } from '../../state/army/RegularsState';
import type { WarMachineState } from '../../state/army/WarMachineState';

/**
 * test function. Should not be used in integration tests related on TurnManagement
 * @param unit
 * @param gameState
 * @param landPos
 */
export const placeUnitsOnMap = (
  unit: HeroState | RegularsState | WarMachineState,
  gameState: GameState,
  landPos: LandPosition
): void => {
  let newArmy;
  if (isHeroType(unit.type)) {
    newArmy = armyFactory(gameState.turnOwner, landPos, { hero: unit as HeroState });
  } else {
    if (isWarMachine(unit.type)) {
      newArmy = armyFactory(gameState.turnOwner, landPos, {
        warMachine: unit as WarMachineState,
      });
    } else {
      newArmy = armyFactory(gameState.turnOwner, landPos, {
        regular: unit as RegularsState,
      });
    }
  }
  Object.assign(gameState, addArmyToGameState(gameState, newArmy));
};
