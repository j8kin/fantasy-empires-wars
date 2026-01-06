import type { HeroUnitType, RegularUnitType, WarMachineType } from '../../types/UnitType';
import type { Effect } from '../../types/Effect';
import type { RegularsState, UnitRankType } from './RegularsState';
import type { HeroState } from './HeroState';
import type { MovementState } from './MovementState';
import type { WarMachineState } from './WarMachineState';

export type HeroBriefInfo = { name: string; type: HeroUnitType; level: number };
export type RegularsBriefInfo = { id: RegularUnitType; rank: UnitRankType; count: number };
export type WarMachinesBriefInfo = { type: WarMachineType; count: number; durability: number };

export interface ArmyBriefInfo {
  heroes: HeroBriefInfo[];
  regulars: RegularsBriefInfo[];
  warMachines: WarMachinesBriefInfo[];
}

export interface ArmyState {
  id: string;
  controlledBy: string; // player.id
  heroes: HeroState[];
  regulars: RegularsState[];
  warMachines: WarMachineState[];
  movement: MovementState;
  effects: Effect[];
}
