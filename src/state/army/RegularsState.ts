import { RegularUnitType } from '../../types/UnitType';
import { BaseUnitStats } from '../../types/BaseUnit';

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
