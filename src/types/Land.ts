import { Alignment } from './Alignment';
import { HeroUnitType, RegularUnitType, UnitType } from './Army';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Lands

export enum LandType {
  NONE = 'None',
  // Regular lands
  PLAINS = 'Plains',
  MOUNTAINS = 'Mountains',
  GREEN_FOREST = 'Green Forest',
  DARK_FOREST = 'Dark Forest',
  HILLS = 'Hills',
  SWAMP = 'Swamp',
  DESERT = 'Desert',
  // special lands
  VOLCANO = 'Volcano',
  LAVA = 'Lava',
  SUN_SPIRE_PEAKS = 'Sunspire Peaks',
  GOLDEN_PLAINS = 'Golden Plains',
  HEARTWOOD_COVE = 'Heartwood Grove',
  VERDANT_GLADE = 'Verdant Glade',
  CRISTAL_BASIN = 'Crystal Basin',
  MISTY_GLADES = 'Misty Glades',
  SHADOW_MIRE = 'Shadow Mire',
  BLIGHTED_FEN = 'Blighted Fen',
}

export const getSpecialLandTypes = (): LandType[] => [
  LandType.VOLCANO,
  LandType.LAVA,
  LandType.SUN_SPIRE_PEAKS,
  LandType.GOLDEN_PLAINS,
  LandType.HEARTWOOD_COVE,
  LandType.VERDANT_GLADE,
  LandType.CRISTAL_BASIN,
  LandType.MISTY_GLADES,
  LandType.SHADOW_MIRE,
  LandType.BLIGHTED_FEN,
];

export interface Land {
  id: LandType;
  alignment: Alignment;
  unitsToRecruit: UnitType[];
  goldPerTurn: { min: number; max: number };
  description: string;
}

export const getSurroundingLands = (landType: LandType): LandType[] => {
  switch (landType) {
    case LandType.VOLCANO:
      return [LandType.MOUNTAINS, LandType.DARK_FOREST];
    case LandType.SUN_SPIRE_PEAKS:
      return [LandType.DARK_FOREST, LandType.HILLS];
    case LandType.HEARTWOOD_COVE:
      return [LandType.SWAMP, LandType.GREEN_FOREST];
    case LandType.CRISTAL_BASIN:
      return [LandType.DESERT, LandType.HILLS];
    case LandType.SHADOW_MIRE:
      return [LandType.PLAINS, LandType.SWAMP];
    default:
      return [];
  }
};

export const getRegularLandTypes = (): LandType[] => {
  return [
    LandType.PLAINS,
    LandType.MOUNTAINS,
    LandType.GREEN_FOREST,
    LandType.DARK_FOREST,
    LandType.HILLS,
    LandType.SWAMP,
    LandType.DESERT,
  ];
};

export const getMainSpecialLandTypes = (): LandType[] => {
  return [
    LandType.VOLCANO,
    LandType.SUN_SPIRE_PEAKS,
    LandType.HEARTWOOD_COVE,
    LandType.CRISTAL_BASIN,
    LandType.SHADOW_MIRE,
  ];
};

export const getNearSpecialLandTypes = (id: LandType): LandType => {
  switch (id) {
    case LandType.VOLCANO:
      return LandType.LAVA;
    case LandType.SUN_SPIRE_PEAKS:
      return LandType.GOLDEN_PLAINS;
    case LandType.HEARTWOOD_COVE:
      return LandType.VERDANT_GLADE;
    case LandType.CRISTAL_BASIN:
      return LandType.MISTY_GLADES;
    case LandType.SHADOW_MIRE:
      return LandType.BLIGHTED_FEN;
    default:
      return LandType.NONE;
  }
};

// common units which would be able to recruit on any land type
// some additional restriction could apply based on building and players alignment and type
const commonUnitsToRecruit: UnitType[] = [
  // common regular unit available on all lands
  RegularUnitType.WARD_HANDS,
  // war machines
  RegularUnitType.BALLISTA,
  RegularUnitType.CATAPULT,
  // mages (could be restricted based available mage towers)
  HeroUnitType.PYROMANCER,
  HeroUnitType.DRUID,
  HeroUnitType.CLERIC,
  HeroUnitType.ENCHANTER,
  HeroUnitType.NECROMANCER,
  // special non-magical Hero recruit only by related player type
  HeroUnitType.WARSMITH,
];

export const getLandById = (id: LandType): Land => {
  switch (id) {
    case LandType.PLAINS:
      return {
        id: LandType.PLAINS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 650, max: 1000 },
        description:
          'Wide open fields where wind carries old war songs, and wanderers vanish beneath endless sky.',
      };
    case LandType.MOUNTAINS:
      return {
        id: LandType.MOUNTAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.DWARF, HeroUnitType.HAMMER_LORD],
        goldPerTurn: { min: 900, max: 1150 },
        description:
          'Stone giants forged in ancient upheaval; their frozen peaks guard secrets older than kingdoms.',
      };
    case LandType.GREEN_FOREST:
      return {
        id: LandType.GREEN_FOREST,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 800, max: 950 },
        description:
          'Sunlit woods where gentle spirits linger, guiding hunters, wanderers, and the lost.',
      };
    case LandType.DARK_FOREST:
      return {
        id: LandType.DARK_FOREST,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          RegularUnitType.DARK_ELF,
          HeroUnitType.SHADOW_BLADE,
        ],
        goldPerTurn: { min: 800, max: 950 },
        description:
          'A brooding woodland where moonlight falters, and unseen things watch from between twisted boughs.',
      };
    case LandType.HILLS:
      return {
        id: LandType.HILLS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.HALFLING, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 500, max: 700 },
        description:
          'Rolling highlands shaped by time and storms, favored by scouts who read stories in every ridge.',
      };
    case LandType.SWAMP:
      return {
        id: LandType.SWAMP,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 350, max: 550 },
        description:
          'Murk and moss entwine here, where each step sinks into whispers of forgotten, half-drowned tales.',
      };
    case LandType.DESERT:
      return {
        id: LandType.DESERT,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          HeroUnitType.FIGHTER,
          HeroUnitType.OGR,
          HeroUnitType.HAMMER_LORD,
          HeroUnitType.RANGER,
        ],
        goldPerTurn: { min: 150, max: 270 },
        description:
          'Endless dunes scorched by merciless suns, hiding relics swallowed by empires long fallen.',
      };
    // special lands
    case LandType.VOLCANO:
      return {
        id: LandType.VOLCANO,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A furious mountain whose molten heart roars beneath the world, hungry for offerings of stone.',
      };
    case LandType.LAVA:
      return {
        id: LandType.LAVA,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'A seething river of fire where earth’s skin tears open, leaving only heat, ruin, and trembling air.',
      };
    case LandType.SUN_SPIRE_PEAKS:
      return {
        id: LandType.SUN_SPIRE_PEAKS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.DWARF, HeroUnitType.HAMMER_LORD],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'Radiant heights bathed in celestial fire, said to echo with the hymns of the first dawn.',
      };
    case LandType.GOLDEN_PLAINS:
      return {
        id: LandType.GOLDEN_PLAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          RegularUnitType.DWARF,
          HeroUnitType.FIGHTER,
          RegularUnitType.WARRIOR,
        ],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Grasses shimmer like sun-forged metal, nurturing harvests blessed by the land’s ancient warmth.',
      };
    case LandType.HEARTWOOD_COVE:
      return {
        id: LandType.HEARTWOOD_COVE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'The cradle of living forests, where colossal trees whisper the pulse of Orrivane itself.',
      };
    case LandType.VERDANT_GLADE:
      return {
        id: LandType.VERDANT_GLADE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'A lush sanctuary bursting with wild growth, where nature unfurls in joyous, untamed abundance.',
      };
    case LandType.CRISTAL_BASIN:
      return {
        id: LandType.CRISTAL_BASIN,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A hollow of shimmering crystal veins that catch stray moonlight, bending it into spectral hues.',
      };
    case LandType.MISTY_GLADES:
      return {
        id: LandType.MISTY_GLADES,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Cool lowlands veiled in drifting blue mist, where sound softens and time feels strangely thin.',
      };
    case LandType.SHADOW_MIRE:
      return {
        id: LandType.SHADOW_MIRE,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
        description:
          'A stagnant bog where shadows cling to the water, feeding on fear as readily as decay.',
      };
    case LandType.BLIGHTED_FEN:
      return {
        id: LandType.BLIGHTED_FEN,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 500, max: 600 },
        description:
          'Rot-soaked marshland cursed by old sorcery, where every root and reed seems to wither in despair.',
      };
    default:
      // used on map generation
      return {
        id: LandType.NONE,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [],
        goldPerTurn: { min: 0, max: 0 },
        description: '',
      };
  }
};
