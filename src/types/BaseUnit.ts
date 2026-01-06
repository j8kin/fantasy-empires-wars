import type { AlignmentType } from './Alignment';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { BuildingType } from './Building';
import type { WarMachineState } from '../state/army/WarMachineState';

export type Unit = HeroState | RegularsState | WarMachineState;

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
