import type { AlignmentType } from '../../types/Alignment';
import { HeroUnitType } from '../../types/UnitType';
import type { PlayerColorName } from '../../types/PlayerColors';

export type PlayerType = 'human' | 'computer';
export const RaceName = {
  HUMAN: 'Human',
  ELF: 'Elf',
  DWARF: 'Dwarf',
  ORC: 'Orc',
  UNDEAD: 'Undead',
} as const;

export type PlayerRace = (typeof RaceName)[keyof typeof RaceName];

export interface PlayerProfile {
  id: string;
  name: string;
  alignment: AlignmentType;
  race: PlayerRace;
  type: HeroUnitType;
  undead: boolean;
  level: number; // up to MAX_HERO_LEVEL
  description: string;
  color: PlayerColorName; // base player color when game starts continues current color
}
