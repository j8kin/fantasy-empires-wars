import { UnitType, RegularUnitType } from '../../types/UnitType';
import { isHeroType } from './unitTypeChecks';

/**
 * Returns the number of turns required to recruit a specific unit type
 * @param unitType - The unit type to get recruitment duration for
 * @returns Number of turns (1-3)
 */
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
