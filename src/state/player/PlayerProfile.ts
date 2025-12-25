import type { AlignmentType } from '../../types/Alignment';
import type { HeroUnitType } from '../../types/UnitType';
import type { PlayerColorName } from '../../types/PlayerColors';

export type PlayerType = 'human' | 'computer';
export type PlayerRace = 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Dark-elf' | 'Undead';

export interface PlayerProfile {
  id: string;
  name: string;
  alignment: AlignmentType;
  race: PlayerRace;
  type: HeroUnitType;
  level: number; // up to MAX_HERO_LEVEL
  description: string;
  color: PlayerColorName; // base player color when game starts continues current color
}
