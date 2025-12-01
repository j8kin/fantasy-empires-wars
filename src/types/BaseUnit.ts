import { Alignment } from './Alignment';
import { HeroState } from '../state/army/HeroState';
import { RegularsState } from '../state/army/RegularsState';

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
