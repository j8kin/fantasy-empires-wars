import { Alignment } from './Alignment';
import { RegularUnitType } from './UnitType';
import { BaseUnitStats, getBaseUnitStats, getRecruitDuration } from './BaseUnit';

export enum UnitRank {
  REGULAR = 'regular',
  VETERAN = 'veteran',
  ELITE = 'elite',
}

export interface RegularUnit {
  get id(): RegularUnitType;
  get rank(): UnitRank;
  get count(): number;
  set count(newCount: number);
  /** return immutable copy of base stats */
  get baseStats(): BaseUnitStats;
  get alignment(): Alignment;
  get recruitCost(): number;
  get recruitDuration(): number;
  get maintainCost(): number;
  get description(): string;

  levelUp(): void;
}

export const createRegularUnit = (
  unitType: RegularUnitType,
  initialCount: number | undefined = undefined
): RegularUnit => {
  const baseUnitStats = getBaseUnitStats(unitType);
  let level = UnitRank.REGULAR;
  let count = initialCount == null ? getRegularUnitCount(unitType) : initialCount;
  return {
    get id(): RegularUnitType {
      return unitType;
    },
    get rank(): UnitRank {
      return level;
    },
    get count(): number {
      return count;
    },
    set count(newCount) {
      count = newCount;
    },
    /** return immutable copy of base stats */
    get baseStats(): BaseUnitStats {
      return { ...baseUnitStats };
    },
    get alignment(): Alignment {
      return baseUnitStats.alignment;
    },
    get recruitCost(): number {
      return baseUnitStats.recruitCost;
    },
    get recruitDuration(): number {
      return getRecruitDuration(unitType);
    },
    get maintainCost(): number {
      return baseUnitStats.maintainCost;
    },
    get description(): string {
      return baseUnitStats.description;
    },
    levelUp() {
      if (level === UnitRank.REGULAR) {
        level = UnitRank.VETERAN;
      } else {
        level = UnitRank.ELITE;
      }
      // todo calculate new base RegularUnit Stats
    },
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
