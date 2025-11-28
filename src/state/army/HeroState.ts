import { HeroUnitType } from '../../types/UnitType';
import { Artifact } from '../../types/Treasures';
import { BaseUnitStats } from '../../types/BaseUnit';

export interface HeroState {
  id: string; // uuid
  type: HeroUnitType;
  name: string;
  level: number;
  baseStats: BaseUnitStats;
  artifacts: Artifact[]; // for now, it is planned to have only one artifact per hero
  mana?: number; // how many mana produced per turn, undefined for non-magic heroes
}
