import { isHeroType } from './unitTypeChecks';
import { RegularUnitName } from '../../types/UnitType';
import type { UnitType } from '../../types/UnitType';

/**
 * Returns the number of turns required to recruit a specific unit type
 * @param unitType - The unit type to get recruitment duration for
 * @returns Number of turns (1-3)
 */
export const getRecruitDuration = (unitType: UnitType): number => {
  if (isHeroType(unitType)) return 3;

  switch (unitType) {
    case RegularUnitName.CATAPULT:
    case RegularUnitName.BALLISTA:
      return 3;
    case RegularUnitName.HALFLING:
    case RegularUnitName.ELF:
    case RegularUnitName.DARK_ELF:
      return 2;
    default:
      return 1;
  }
};
