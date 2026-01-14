import { getRecruitInfo, unitsBaseCombatStats } from '../domain/unit/unitRepository';
import { UnitRank } from '../state/army/RegularsState';
import type { RegularsState } from '../state/army/RegularsState';
import type { RegularUnitType } from '../types/UnitType';

export const regularsFactory = (
  unitType: RegularUnitType,
  initialCount: number | undefined = undefined
): RegularsState => {
  const unitRecruitInfo = getRecruitInfo(unitType);
  return {
    type: Object.freeze(unitType),
    combatStats: { ...unitsBaseCombatStats(unitType) },
    rank: UnitRank.REGULAR,
    count: initialCount == null ? unitRecruitInfo.recruitedUnits : initialCount,
    cost: unitRecruitInfo.maintainCost,
  };
};
