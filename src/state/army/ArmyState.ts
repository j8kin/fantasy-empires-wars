import type { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import type { Effect } from '../../types/Effect';
import type { RegularsState, UnitRankType } from './RegularsState';
import type { HeroState } from './HeroState';
import type { MovementState } from './MovementState';
import type { WarMachineState } from './WarMachineState';

export interface ArmyBriefInfo {
  heroes: { name: string; type: HeroUnitType; level: number }[];
  regulars: { id: RegularUnitType; rank: UnitRankType; count: number }[];
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
