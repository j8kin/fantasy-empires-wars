import { Alignment } from './Alignment';
import { RegularUnitType } from './UnitType';
import { getBaseUnitStats, getRecruitDuration } from './BaseUnit';

export enum UnitRank {
  REGULAR = 'regular',
  VETERAN = 'veteran',
  ELITE = 'elite',
}

export interface RegularUnit {
  get id(): RegularUnitType;
  get level(): UnitRank;
  get count(): number;
  set count(newCount: number);
  // get BaseUnitStats(): BaseUnitStats;
  get attack(): number;
  get defense(): number;
  get range(): number | undefined;
  get rangeDamage(): number | undefined;
  get health(): number;
  get speed(): number;
  get alignment(): Alignment;
  get recruitCost(): number;
  get recruitDuration(): number;
  get maintainCost(): number;
  get description(): string;

  levelUp(): void;
}

export const createRegularUnit = (unitType: RegularUnitType): RegularUnit => {
  const baseUnitStats = getBaseUnitStats(unitType);
  let level = UnitRank.REGULAR;
  let count = getRegularUnitCount(unitType);
  return {
    get id(): RegularUnitType {
      return unitType;
    },
    get level(): UnitRank {
      return level;
    },
    get count(): number {
      return count;
    },
    set count(newCount) {
      count = newCount;
    },
    get attack(): number {
      return baseUnitStats.attack;
    },
    get defense(): number {
      return baseUnitStats.defense;
    },
    get range(): number | undefined {
      return baseUnitStats.range;
    },
    get rangeDamage(): number | undefined {
      return baseUnitStats.rangeDamage;
    },
    get health(): number {
      return baseUnitStats.health;
    },
    get speed(): number {
      return baseUnitStats.speed;
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
