import { isMageType } from '../domain/unit/unitTypeChecks';
import { RaceName } from '../state/player/PlayerProfile';
import type { PlayerRace } from '../state/player/PlayerProfile';
import type { HeroState } from '../state/army/HeroState';
import type { ImmutablePair } from '../types/Pair';

// Import all figure assets for Vite bundling
import humanBronzePng from './figures/human/bronze.png';
import humanSilverPng from './figures/human/silver.png';
import humanGoldPng from './figures/human/gold.png';
import elfBronzePng from './figures/elf/bronze.png';
import elfSilverPng from './figures/elf/silver.png';
import elfGoldPng from './figures/elf/gold.png';
import dwarfBronzePng from './figures/dwarf/bronze.png';
import dwarfSilverPng from './figures/dwarf/silver.png';
import dwarfGoldPng from './figures/dwarf/gold.png';
import orcBronzePng from './figures/orc/bronze.png';
import orcSilverPng from './figures/orc/silver.png';
import orcGoldPng from './figures/orc/gold.png';
import drivenCreaturesPng from './figures/driven/creatures.png';
import drivenHeroPng from './figures/driven/hero.png';
import drivenControlPng from './figures/driven/control.png';

/**
 * Returns all figure asset [key, path] pairs for preloading in Phaser.
 */
export const getFigureAssetPaths = (): ImmutablePair[] => {
  return [
    ['figure_human_bronze', humanBronzePng],
    ['figure_human_silver', humanSilverPng],
    ['figure_human_gold', humanGoldPng],
    ['figure_elf_bronze', elfBronzePng],
    ['figure_elf_silver', elfSilverPng],
    ['figure_elf_gold', elfGoldPng],
    ['figure_dwarf_bronze', dwarfBronzePng],
    ['figure_dwarf_silver', dwarfSilverPng],
    ['figure_dwarf_gold', dwarfGoldPng],
    ['figure_orc_bronze', orcBronzePng],
    ['figure_orc_silver', orcSilverPng],
    ['figure_orc_gold', orcGoldPng],
    ['figure_driven_creatures', drivenCreaturesPng],
    ['figure_driven_hero', drivenHeroPng],
    ['figure_driven_control', drivenControlPng],
  ];
};

/**
 * Determines the Phaser texture key for an army figure based on player race and
 * army composition.
 *
 * For standard races (Human, Elf, Dwarf, Orc):
 *   - bronze:  no heroes present (regular units only)
 *   - silver:  heroes present, highest-level hero is melee (non-mage)
 *   - gold:    heroes present, highest-level hero is magic (mage)
 *
 * For Undead (mapped to "driven" folder):
 *   - creatures:  regular units present, no heroes
 *   - hero:       heroes present, no regular units
 *   - control:    both heroes and regular units present
 */
export const getArmyFigureImg = (race: PlayerRace, heroes: HeroState[], hasRegulars: boolean): string => {
  if (race === RaceName.UNDEAD) {
    const hasHeroes = heroes.length > 0;
    if (hasHeroes && hasRegulars) return 'figure_driven_control';
    if (hasHeroes) return 'figure_driven_hero';
    return 'figure_driven_creatures';
  }

  const raceFolder = race.toLowerCase();

  if (heroes.length === 0) return `figure_${raceFolder}_bronze`;

  const topHero = heroes.reduce((best, hero) => (hero.level >= best.level ? hero : best));
  return isMageType(topHero.type) ? `figure_${raceFolder}_gold` : `figure_${raceFolder}_silver`;
};
