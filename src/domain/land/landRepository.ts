import { LandName } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import { HeroUnitName, RegularUnitName } from '../../types/UnitType';
import type { Land, LandType } from '../../types/Land';

/**
 * Retrieves complete land data by land type
 * @param id - The land type to get data for
 * @returns Complete land configuration including alignment, units, gold, description
 */
export const getLandById = (id: LandType): Land => {
  switch (id) {
    case LandName.PLAINS:
      return {
        id: LandName.PLAINS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 650, max: 1000 },
        description:
          'Wide open fields where wind carries old war songs, and wanderers vanish beneath endless sky.',
      };
    case LandName.MOUNTAINS:
      return {
        id: LandName.MOUNTAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [
          RegularUnitName.WARD_HANDS,
          RegularUnitName.DWARF,
          HeroUnitName.HAMMER_LORD,
        ],
        goldPerTurn: { min: 900, max: 1150 },
        description:
          'Stone giants forged in ancient upheaval; their frozen peaks guard secrets older than kingdoms.',
      };
    case LandName.GREEN_FOREST:
      return {
        id: LandName.GREEN_FOREST,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ELF, HeroUnitName.RANGER],
        goldPerTurn: { min: 800, max: 950 },
        description:
          'Sunlit woods where gentle spirits linger, guiding hunters, wanderers, and the lost.',
      };
    case LandName.DARK_FOREST:
      return {
        id: LandName.DARK_FOREST,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [
          RegularUnitName.WARD_HANDS,
          RegularUnitName.DARK_ELF,
          HeroUnitName.SHADOW_BLADE,
        ],
        goldPerTurn: { min: 800, max: 950 },
        description:
          'A brooding woodland where moonlight falters, and unseen things watch from between twisted boughs.',
      };
    case LandName.HILLS:
      return {
        id: LandName.HILLS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [
          RegularUnitName.WARD_HANDS,
          RegularUnitName.HALFLING,
          HeroUnitName.FIGHTER,
        ],
        goldPerTurn: { min: 500, max: 700 },
        description:
          'Rolling highlands shaped by time and storms, favored by scouts who read stories in every ridge.',
      };
    case LandName.SWAMP:
      return {
        id: LandName.SWAMP,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 350, max: 550 },
        description:
          'Murk and moss entwine here, where each step sinks into whispers of forgotten, half-drowned tales.',
      };
    case LandName.DESERT:
      return {
        id: LandName.DESERT,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [
          RegularUnitName.WARD_HANDS,
          HeroUnitName.FIGHTER,
          HeroUnitName.OGR,
          HeroUnitName.HAMMER_LORD,
          HeroUnitName.RANGER,
        ],
        goldPerTurn: { min: 150, max: 270 },
        description:
          'Endless dunes scorched by merciless suns, hiding relics swallowed by empires long fallen.',
      };
    // special lands
    case LandName.VOLCANO:
      return {
        id: LandName.VOLCANO,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A furious mountain whose molten heart roars beneath the world, hungry for offerings of stone.',
      };
    case LandName.LAVA:
      return {
        id: LandName.LAVA,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 500, max: 600 },
        description:
          "A seething river of fire where earth's skin tears open, leaving only heat, ruin, and trembling air.",
      };
    case LandName.SUN_SPIRE_PEAKS:
      return {
        id: LandName.SUN_SPIRE_PEAKS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [
          RegularUnitName.WARD_HANDS,
          RegularUnitName.DWARF,
          HeroUnitName.HAMMER_LORD,
        ],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'Radiant heights bathed in celestial fire, said to echo with the hymns of the first dawn.',
      };
    case LandName.GOLDEN_PLAINS:
      return {
        id: LandName.GOLDEN_PLAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [
          RegularUnitName.WARD_HANDS,
          RegularUnitName.DWARF,
          HeroUnitName.FIGHTER,
          RegularUnitName.WARRIOR,
        ],
        goldPerTurn: { min: 500, max: 600 },
        description:
          "Grasses shimmer like sun-forged metal, nurturing harvests blessed by the land's ancient warmth.",
      };
    case LandName.HEARTWOOD_GROVE:
      return {
        id: LandName.HEARTWOOD_GROVE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ELF, HeroUnitName.RANGER],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'The cradle of living forests, where colossal trees whisper the pulse of Orrivane itself.',
      };
    case LandName.VERDANT_GLADE:
      return {
        id: LandName.VERDANT_GLADE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ELF, HeroUnitName.RANGER],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'A lush sanctuary bursting with wild growth, where nature unfurls in joyous, untamed abundance.',
      };
    case LandName.CRISTAL_BASIN:
      return {
        id: LandName.CRISTAL_BASIN,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A hollow of shimmering crystal veins that catch stray moonlight, bending it into spectral hues.',
      };
    case LandName.MISTY_GLADES:
      return {
        id: LandName.MISTY_GLADES,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Cool lowlands veiled in drifting blue mist, where sound softens and time feels strangely thin.',
      };
    case LandName.SHADOW_MIRE:
      return {
        id: LandName.SHADOW_MIRE,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A stagnant bog where shadows cling to the water, feeding on fear as readily as decay.',
      };
    case LandName.BLIGHTED_FEN:
      return {
        id: LandName.BLIGHTED_FEN,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [RegularUnitName.WARD_HANDS, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Rot-soaked marshland cursed by old sorcery, where every root and reed seems to wither in despair.',
      };
    default:
      // used on map generation
      return {
        id: LandName.NONE,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [],
        goldPerTurn: { min: 0, max: 0 },
        description: '',
      };
  }
};
