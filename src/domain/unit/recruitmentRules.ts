import { isHeroType } from './unitTypeChecks';
import { RegularUnitName, WarMachineName } from '../../types/UnitType';
import type { UnitType } from '../../types/UnitType';

/**
 * Returns the number of turns required to recruit a specific unit type
 * @param unitType - The unit type to get recruitment duration for
 * @returns Number of turns (1-3)
 */
export const getRecruitDuration = (unitType: UnitType): number => {
  if (isHeroType(unitType)) return 3;

  switch (unitType) {
    case WarMachineName.CATAPULT:
    case WarMachineName.BALLISTA:
      return 3;
    case WarMachineName.SIEGE_TOWER:
      return 2;
    case WarMachineName.BATTERING_RAM:
      return 1;
    case RegularUnitName.HALFLING:
    case RegularUnitName.ELF:
    case RegularUnitName.DARK_ELF:
      return 2;
    default:
      return 1;
  }
};
