import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { Effect } from '../../types/Effect';
import { RegularsState, UnitRank } from './RegularsState';
import { HeroState } from './HeroState';
import { MovementState } from './MovementState';

export interface ArmyBriefInfo {
  heroes: { name: string; type: HeroUnitType; level: number }[];
  regulars: { id: RegularUnitType; rank: UnitRank; count: number }[];
}

export interface ArmyState {
  id: string;
  controlledBy: string; // player.id
  heroes: HeroState[];
  regulars: RegularsState[];
  movement: MovementState;
  effects: Effect[];
}

export type Armies = ArmyState[];
