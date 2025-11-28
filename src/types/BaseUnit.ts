import { isHeroType, RegularUnitType, UnitType } from './UnitType';
import { Alignment } from './Alignment';
import { HeroState } from '../state/army/HeroState';
import { RegularsState } from '../state/army/RegularsState';

export type Unit = HeroState | RegularsState;

export interface BaseUnitStats {
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  speed: number;
  alignment: Alignment;
  recruitCost: number;
  maintainCost: number;
  description: string;
}

export const getRecruitDuration = (unitType: UnitType): number => {
  if (isHeroType(unitType)) return 3;

  switch (unitType) {
    case RegularUnitType.CATAPULT:
    case RegularUnitType.BALLISTA:
      return 3;
    case RegularUnitType.HALFLING:
    case RegularUnitType.ELF:
    case RegularUnitType.DARK_ELF:
      return 2;
    default:
      return 1;
  }
};
