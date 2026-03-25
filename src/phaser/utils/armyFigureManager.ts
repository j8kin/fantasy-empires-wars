import { isMageType } from '../../domain/unit/unitTypeChecks';
import type { PlayerRace } from '../../state/player/PlayerProfile';
import { RaceName } from '../../state/player/PlayerProfile';
import type { HeroState } from '../../state/army/HeroState';

// Import all figure assets for Vite bundling
import humanBronzePng from '../../assets/figures/human/bronze.png';
import humanSilverPng from '../../assets/figures/human/silver.png';
import humanGoldPng from '../../assets/figures/human/gold.png';
import elfBronzePng from '../../assets/figures/elf/bronze.png';
import elfSilverPng from '../../assets/figures/elf/silver.png';
import elfGoldPng from '../../assets/figures/elf/gold.png';
import dwarfBronzePng from '../../assets/figures/dwarf/bronze.png';
import dwarfSilverPng from '../../assets/figures/dwarf/silver.png';
import dwarfGoldPng from '../../assets/figures/dwarf/gold.png';
import orcBronzePng from '../../assets/figures/orc/bronze.png';
import orcSilverPng from '../../assets/figures/orc/silver.png';
import orcGoldPng from '../../assets/figures/orc/gold.png';
import drivenCreaturesPng from '../../assets/figures/driven/creatures.png';
import drivenHeroPng from '../../assets/figures/driven/hero.png';
import drivenControlPng from '../../assets/figures/driven/control.png';

/**
 * Returns all figure asset [key, path] pairs for preloading in Phaser.
 */
export function getFigureAssetPaths(): Array<[string, string]> {
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
}

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
export function getFigureAssetKey(race: PlayerRace, heroes: HeroState[], hasRegulars: boolean): string {
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
}
