import { unitsBaseStats } from '../domain/unit/unitRepository';
import { UnitRank } from '../state/army/RegularsState';
import type { RegularsState } from '../state/army/RegularsState';
import { RegularUnitType } from '../types/UnitType';
import { RegularUnitName } from '../types/UnitType';

export const regularsFactory = (
  unitType: RegularUnitType,
  initialCount: number | undefined = undefined
): RegularsState => {
  return {
    type: Object.freeze(unitType),
    baseStats: { ...unitsBaseStats(unitType) },
    rank: UnitRank.REGULAR,
    count: initialCount == null ? getRegularUnitCount(unitType) : initialCount,
  };
};

const getRegularUnitCount = (unitType: RegularUnitType): number => {
  switch (unitType) {
    case RegularUnitName.WARD_HANDS:
      return 30;
    case RegularUnitName.HALFLING:
      return 25;
    default:
      return 20;
  }
};
