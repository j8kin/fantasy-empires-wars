import type { RegularUnitType } from '../../types/UnitType';
import type { BaseUnitStats } from '../../types/BaseUnit';

export enum UnitRank {
  REGULAR = 'regular',
  VETERAN = 'veteran',
  ELITE = 'elite',
}

export interface RegularsState {
  type: RegularUnitType;
  rank: UnitRank;
  count: number;
  baseStats: BaseUnitStats;
}
