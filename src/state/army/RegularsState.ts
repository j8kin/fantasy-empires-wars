import type { RegularUnitType } from '../../types/UnitType';
import type { CombatStats } from '../../types/BaseUnit';

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
  combatStats: CombatStats;
  cost: number; // maintenance cost per turn per unit
}
