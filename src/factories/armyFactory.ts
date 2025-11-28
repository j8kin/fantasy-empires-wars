import { v4 as uuid } from 'uuid';
import { LandPosition } from '../state/map/land/LandPosition';
import { HeroState } from '../state/army/HeroState';
import { RegularsState } from '../state/army/RegularsState';
import { movementFactory } from './movementFactory';
import { ArmyState } from '../state/army/ArmyState';

export const armyFactory = (
  controlledBy: string,
  position: LandPosition,
  initHeroes: HeroState[] = [],
  initRegulars: RegularsState[] = []
): ArmyState => {
  return {
    id: Object.freeze(uuid()),
    controlledBy: Object.freeze(controlledBy),
    heroes: [...initHeroes],
    regulars: [...initRegulars],
    movement: movementFactory(position),
  };
};
