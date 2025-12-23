import { LandKind } from '../../types/Land';
import { Alignment } from '../../types/Alignment';
import { HeroUnitName, RegularUnitName } from '../../types/UnitType';
import type { UnitType } from '../../types/UnitType';
import type { Land, LandType } from '../../types/Land';

// common units which would be able to recruit on any land type
// some additional restriction could apply based on building and players alignment and type
const commonUnitsToRecruit: UnitType[] = [
  // common regular unit available on all lands
  RegularUnitName.WARD_HANDS,
  // war machines
  RegularUnitName.BALLISTA,
  RegularUnitName.CATAPULT,
  // mages (could be restricted based available mage towers)
  HeroUnitName.PYROMANCER,
  HeroUnitName.DRUID,
  HeroUnitName.CLERIC,
  HeroUnitName.ENCHANTER,
  HeroUnitName.NECROMANCER,
  // special non-magical Hero recruit only by related player type
  HeroUnitName.WARSMITH,
];

/**
 * Retrieves complete land data by land type
 * @param id - The land type to get data for
 * @returns Complete land configuration including alignment, units, gold, description
 */
export const getLandById = (id: LandType): Land => {
  switch (id) {
    case LandKind.PLAINS:
      return {
        id: LandKind.PLAINS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 650, max: 1000 },
        description:
          'Wide open fields where wind carries old war songs, and wanderers vanish beneath endless sky.',
      };
    case LandKind.MOUNTAINS:
      return {
        id: LandKind.MOUNTAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.DWARF, HeroUnitName.HAMMER_LORD],
        goldPerTurn: { min: 900, max: 1150 },
        description:
          'Stone giants forged in ancient upheaval; their frozen peaks guard secrets older than kingdoms.',
      };
    case LandKind.GREEN_FOREST:
      return {
        id: LandKind.GREEN_FOREST,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ELF, HeroUnitName.RANGER],
        goldPerTurn: { min: 800, max: 950 },
        description:
          'Sunlit woods where gentle spirits linger, guiding hunters, wanderers, and the lost.',
      };
    case LandKind.DARK_FOREST:
      return {
        id: LandKind.DARK_FOREST,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          RegularUnitName.DARK_ELF,
          HeroUnitName.SHADOW_BLADE,
        ],
        goldPerTurn: { min: 800, max: 950 },
        description:
          'A brooding woodland where moonlight falters, and unseen things watch from between twisted boughs.',
      };
    case LandKind.HILLS:
      return {
        id: LandKind.HILLS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.HALFLING, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 500, max: 700 },
        description:
          'Rolling highlands shaped by time and storms, favored by scouts who read stories in every ridge.',
      };
    case LandKind.SWAMP:
      return {
        id: LandKind.SWAMP,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 350, max: 550 },
        description:
          'Murk and moss entwine here, where each step sinks into whispers of forgotten, half-drowned tales.',
      };
    case LandKind.DESERT:
      return {
        id: LandKind.DESERT,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
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
    case LandKind.VOLCANO:
      return {
        id: LandKind.VOLCANO,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A furious mountain whose molten heart roars beneath the world, hungry for offerings of stone.',
      };
    case LandKind.LAVA:
      return {
        id: LandKind.LAVA,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 500, max: 600 },
        description:
          "A seething river of fire where earth's skin tears open, leaving only heat, ruin, and trembling air.",
      };
    case LandKind.SUN_SPIRE_PEAKS:
      return {
        id: LandKind.SUN_SPIRE_PEAKS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.DWARF, HeroUnitName.HAMMER_LORD],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'Radiant heights bathed in celestial fire, said to echo with the hymns of the first dawn.',
      };
    case LandKind.GOLDEN_PLAINS:
      return {
        id: LandKind.GOLDEN_PLAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          RegularUnitName.DWARF,
          HeroUnitName.FIGHTER,
          RegularUnitName.WARRIOR,
        ],
        goldPerTurn: { min: 500, max: 600 },
        description:
          "Grasses shimmer like sun-forged metal, nurturing harvests blessed by the land's ancient warmth.",
      };
    case LandKind.HEARTWOOD_COVE:
      return {
        id: LandKind.HEARTWOOD_COVE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ELF, HeroUnitName.RANGER],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'The cradle of living forests, where colossal trees whisper the pulse of Orrivane itself.',
      };
    case LandKind.VERDANT_GLADE:
      return {
        id: LandKind.VERDANT_GLADE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ELF, HeroUnitName.RANGER],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'A lush sanctuary bursting with wild growth, where nature unfurls in joyous, untamed abundance.',
      };
    case LandKind.CRISTAL_BASIN:
      return {
        id: LandKind.CRISTAL_BASIN,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A hollow of shimmering crystal veins that catch stray moonlight, bending it into spectral hues.',
      };
    case LandKind.MISTY_GLADES:
      return {
        id: LandKind.MISTY_GLADES,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.WARRIOR, HeroUnitName.FIGHTER],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Cool lowlands veiled in drifting blue mist, where sound softens and time feels strangely thin.',
      };
    case LandKind.SHADOW_MIRE:
      return {
        id: LandKind.SHADOW_MIRE,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A stagnant bog where shadows cling to the water, feeding on fear as readily as decay.',
      };
    case LandKind.BLIGHTED_FEN:
      return {
        id: LandKind.BLIGHTED_FEN,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitName.ORC, HeroUnitName.OGR],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Rot-soaked marshland cursed by old sorcery, where every root and reed seems to wither in despair.',
      };
    default:
      // used on map generation
      return {
        id: LandKind.NONE,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [],
        goldPerTurn: { min: 0, max: 0 },
        description: '',
      };
  }
};
