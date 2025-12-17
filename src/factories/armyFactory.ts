import { v4 as uuid } from 'uuid';
import { movementFactory } from './movementFactory';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { ArmyState } from '../state/army/ArmyState';

export const armyFactory = (
  controlledBy: string,
  position: LandPosition,
  initHeroes: HeroState[] = [],
  initRegulars: RegularsState[] = []
): ArmyState => {
  return {
    id: uuid(),
    controlledBy: Object.freeze(controlledBy),
    heroes: [...initHeroes],
    regulars: [...initRegulars],
    movement: movementFactory(position),
    effects: [],
  };
};
