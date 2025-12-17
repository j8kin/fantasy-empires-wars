import type { Alignment } from './Alignment';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';

export type Unit = HeroState | RegularsState;

export interface BaseUnitStats {
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  speed: number;
  alignment: Alignment;
  recruitCost: number;
  maintainCost: number;
  description: string;
}
