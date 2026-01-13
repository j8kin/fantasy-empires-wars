import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { WarMachineState } from '../state/army/WarMachineState';
import type { BuildingType } from './Building';

export type Unit = HeroState | RegularsState | WarMachineState;

export interface CombatStats {
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  speed: number;
}

export interface RecruitmentInfo {
  /** The cost to recruit unit pack **/
  recruitCost: number;
  /** The number of units recruited in pack (all heroes units: 1, regulars: 20-30 based on unit type) **/
  recruitedUnits: number;
  /** Number of turns it takes to recruit a unit **/
  recruitTime: number;
  /** The building where the unit was recruited **/
  recruitedIn: BuildingType;
  /** The cost to maintain one unit per turn **/
  maintainCost: number;
  /** Short Lore description of the unit **/
  description: string;
}
