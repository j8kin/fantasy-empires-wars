import type { AlignmentType } from './Alignment';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { BuildingType } from './Building';

export type Unit = HeroState | RegularsState;

export interface BaseUnitStats {
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  speed: number;
  alignment: AlignmentType;
  recruitCost: number;
  maintainCost: number;
  description: string;
  recruitedIn: BuildingType;
}
