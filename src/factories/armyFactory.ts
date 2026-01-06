import { v4 as uuid } from 'uuid';
import { movementFactory } from './movementFactory';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { ArmyState } from '../state/army/ArmyState';
import type { WarMachineState } from '../state/army/WarMachineState';

export const armyFactory = (
  controlledBy: string,
  position: LandPosition,
  {
    hero,
    regular,
    warMachine,
  }:
    | {
        hero?: HeroState;
        regular?: RegularsState;
        warMachine?: WarMachineState;
      }
    | undefined = {}
): ArmyState => {
  return {
    id: Object.freeze(uuid()),
    controlledBy: Object.freeze(controlledBy),
    heroes: hero ? [hero] : [],
    regulars: regular ? [regular] : [],
    warMachines: warMachine ? [warMachine] : [],
    movement: movementFactory(position),
    effects: [],
  };
};
