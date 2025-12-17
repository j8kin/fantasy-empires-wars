import { unitsBaseStats } from '../domain/unit/unitRepository';
import { UnitRank } from '../state/army/RegularsState';
import { RegularUnitType } from '../types/UnitType';
import type { RegularsState } from '../state/army/RegularsState';

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
    case RegularUnitType.WARD_HANDS:
      return 30;
    case RegularUnitType.HALFLING:
      return 25;
    case RegularUnitType.BALLISTA:
    case RegularUnitType.CATAPULT:
      return 1;
    default:
      return 20;
  }
};
