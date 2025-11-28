import { v4 as uuid } from 'uuid';
import { HeroUnitType, isMageType } from '../types/UnitType';
import { HeroState } from '../state/army/HeroState';
import { unitsBaseStats } from '../data/units/unitsBaseStats';

export const heroFactory = (heroType: HeroUnitType, name: string): HeroState => {
  return {
    id: Object.freeze(uuid()),
    type: Object.freeze(heroType),
    name: Object.freeze(name),
    level: 1,
    baseStats: { ...unitsBaseStats(heroType) },
    artifacts: [],
    mana: isMageType(heroType) ? 1 : undefined,
  };
};
