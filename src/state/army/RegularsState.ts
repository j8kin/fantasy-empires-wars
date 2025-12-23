import type { RegularUnitType } from '../../types/UnitType';
import type { BaseUnitStats } from '../../types/BaseUnit';

export const UnitRank = {
  REGULAR: 'regular',
  VETERAN: 'veteran',
  ELITE: 'elite',
} as const;

export type UnitRankType = (typeof UnitRank)[keyof typeof UnitRank];

export interface RegularsState {
  type: RegularUnitType;
  rank: UnitRankType;
  count: number;
  baseStats: BaseUnitStats;
}
