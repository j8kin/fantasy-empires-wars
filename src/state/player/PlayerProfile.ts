import type { AlignmentType } from '../../types/Alignment';
import type { HeroUnitType } from '../../types/UnitType';
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

export const Doctrine = {
  NONE: 'None',
  /** Focus on regular army with magic support **/
  MELEE: 'Melee',
  /** Focus on magic army with regular support **/
  MAGIC: 'Magic',
  /** Anti-magic doctrine */
  ANTI_MAGIC: 'Anti Magic',
  /** Focus on a magic army with no regular support **/
  PURE_MAGIC: 'Pure Magic',
  /** Undead doctrine */
  UNDEAD: 'Undead',
} as const;
export type DoctrineType = (typeof Doctrine)[keyof typeof Doctrine];

export interface PlayerProfile {
  id: string;
  name: string;
  alignment: AlignmentType;
  race: PlayerRace;
  type: HeroUnitType;
  doctrine: DoctrineType;
  level: number; // up to MAX_HERO_LEVEL
  description: string;
  color: PlayerColorName; // base player color when game starts continues current color
}
