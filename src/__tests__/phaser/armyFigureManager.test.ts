import { getFigureAssetKey, getFigureAssetPaths } from '../../phaser/utils/armyFigureManager';
import { RaceName } from '../../state/player/PlayerProfile';
import { HeroUnitName } from '../../types/UnitType';
import type { HeroState } from '../../state/army/HeroState';

/** Minimal HeroState stub for testing */
const makeHero = (type: HeroState['type'], level: number): HeroState => ({ type, level }) as HeroState;

describe('armyFigureManager', () => {
  describe('getFigureAssetPaths', () => {
    it('returns 15 entries (5 races × 3 variants)', () => {
      const paths = getFigureAssetPaths();
      expect(paths).toHaveLength(15);
    });

    it('every entry is a [key, path] tuple', () => {
      getFigureAssetPaths().forEach(([key, path]) => {
        expect(typeof key).toBe('string');
        expect(key).toMatch(/^figure_/);
        expect(typeof path).toBe('string');
      });
    });

    it('includes all expected asset keys', () => {
      const keys = getFigureAssetPaths().map(([k]) => k);
      const expected = [
        'figure_human_bronze',
        'figure_human_silver',
        'figure_human_gold',
        'figure_elf_bronze',
        'figure_elf_silver',
        'figure_elf_gold',
        'figure_dwarf_bronze',
        'figure_dwarf_silver',
        'figure_dwarf_gold',
        'figure_orc_bronze',
        'figure_orc_silver',
        'figure_orc_gold',
        'figure_driven_creatures',
        'figure_driven_hero',
        'figure_driven_control',
      ];
      expected.forEach((k) => expect(keys).toContain(k));
    });
  });

  describe('getFigureAssetKey – standard races', () => {
    describe('bronze: no heroes (regular units only)', () => {
      it('Human with regulars, no heroes → bronze', () => {
        expect(getFigureAssetKey(RaceName.HUMAN, [], true)).toBe('figure_human_bronze');
      });

      it('Elf with regulars, no heroes → bronze', () => {
        expect(getFigureAssetKey(RaceName.ELF, [], true)).toBe('figure_elf_bronze');
      });

      it('Dwarf with no heroes and no regulars → bronze (empty army edge case)', () => {
        expect(getFigureAssetKey(RaceName.DWARF, [], false)).toBe('figure_dwarf_bronze');
      });

      it('Orc with no heroes → bronze', () => {
        expect(getFigureAssetKey(RaceName.ORC, [], true)).toBe('figure_orc_bronze');
      });
    });

    describe('silver: heroes present, highest-level hero is melee', () => {
      it('Human army with a single melee hero → silver', () => {
        const heroes = [makeHero(HeroUnitName.FIGHTER, 5)];
        expect(getFigureAssetKey(RaceName.HUMAN, heroes, true)).toBe('figure_human_silver');
      });

      it('Elf army with a Ranger hero → silver', () => {
        const heroes = [makeHero(HeroUnitName.RANGER, 8)];
        expect(getFigureAssetKey(RaceName.ELF, heroes, true)).toBe('figure_elf_silver');
      });

      it('uses highest-level hero to decide tier: mage(5) + melee(10) → silver', () => {
        const heroes = [makeHero(HeroUnitName.PYROMANCER, 5), makeHero(HeroUnitName.FIGHTER, 10)];
        expect(getFigureAssetKey(RaceName.HUMAN, heroes, true)).toBe('figure_human_silver');
      });

      it('heroes-only army (no regulars) with melee hero → still silver', () => {
        const heroes = [makeHero(HeroUnitName.HAMMER_LORD, 7)];
        expect(getFigureAssetKey(RaceName.DWARF, heroes, false)).toBe('figure_dwarf_silver');
      });
    });

    describe('gold: heroes present, highest-level hero is mage', () => {
      it('Human army with a single mage hero → gold', () => {
        const heroes = [makeHero(HeroUnitName.PYROMANCER, 6)];
        expect(getFigureAssetKey(RaceName.HUMAN, heroes, true)).toBe('figure_human_gold');
      });

      it('Elf army with Druid hero → gold', () => {
        const heroes = [makeHero(HeroUnitName.DRUID, 9)];
        expect(getFigureAssetKey(RaceName.ELF, heroes, true)).toBe('figure_elf_gold');
      });

      it('uses highest-level hero: melee(5) + mage(10) → gold', () => {
        const heroes = [makeHero(HeroUnitName.FIGHTER, 5), makeHero(HeroUnitName.NECROMANCER, 10)];
        expect(getFigureAssetKey(RaceName.HUMAN, heroes, true)).toBe('figure_human_gold');
      });

      it('heroes-only army with mage → still gold', () => {
        const heroes = [makeHero(HeroUnitName.ENCHANTER, 12)];
        expect(getFigureAssetKey(RaceName.ORC, heroes, false)).toBe('figure_orc_gold');
      });

      it('tie in level: last mage wins when equal to melee level', () => {
        // Both at level 10: mage is iterated last, reduce keeps mage (>=)
        const heroes = [makeHero(HeroUnitName.FIGHTER, 10), makeHero(HeroUnitName.CLERIC, 10)];
        expect(getFigureAssetKey(RaceName.HUMAN, heroes, true)).toBe('figure_human_gold');
      });
    });
  });

  describe('getFigureAssetKey – Undead (driven)', () => {
    it('creatures: regulars present, no heroes', () => {
      expect(getFigureAssetKey(RaceName.UNDEAD, [], true)).toBe('figure_driven_creatures');
    });

    it('hero: heroes present, no regulars', () => {
      const heroes = [makeHero(HeroUnitName.WARSMITH, 4)];
      expect(getFigureAssetKey(RaceName.UNDEAD, heroes, false)).toBe('figure_driven_hero');
    });

    it('hero: mage hero present, no regulars', () => {
      const heroes = [makeHero(HeroUnitName.NECROMANCER, 8)];
      expect(getFigureAssetKey(RaceName.UNDEAD, heroes, false)).toBe('figure_driven_hero');
    });

    it('control: both heroes and regulars present', () => {
      const heroes = [makeHero(HeroUnitName.WARSMITH, 4)];
      expect(getFigureAssetKey(RaceName.UNDEAD, heroes, true)).toBe('figure_driven_control');
    });

    it('creatures: no heroes and no regulars (empty army edge case)', () => {
      expect(getFigureAssetKey(RaceName.UNDEAD, [], false)).toBe('figure_driven_creatures');
    });
  });
});
