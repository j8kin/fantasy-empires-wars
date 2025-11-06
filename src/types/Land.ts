import { Alignment } from './Alignment';
import { HeroUnitType, RegularUnitType, UnitType } from './Army';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Lands

export enum LAND_TYPE {
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

export interface Land {
  id: LAND_TYPE;
  alignment: Alignment;
  unitsToRecruit: UnitType[];
  goldPerTurn: { min: number; max: number };
}

export const getSurroundingLands = (landType: LAND_TYPE): LAND_TYPE[] => {
  switch (landType) {
    case LAND_TYPE.VOLCANO:
      return [LAND_TYPE.MOUNTAINS, LAND_TYPE.DARK_FOREST];
    case LAND_TYPE.SUN_SPIRE_PEAKS:
      return [LAND_TYPE.DARK_FOREST, LAND_TYPE.HILLS];
    case LAND_TYPE.HEARTWOOD_COVE:
      return [LAND_TYPE.SWAMP, LAND_TYPE.GREEN_FOREST];
    case LAND_TYPE.CRISTAL_BASIN:
      return [LAND_TYPE.DESERT, LAND_TYPE.HILLS];
    case LAND_TYPE.SHADOW_MIRE:
      return [LAND_TYPE.PLAINS, LAND_TYPE.SWAMP];
    default:
      return [];
  }
};

export const getRegularLandTypes = (): LAND_TYPE[] => {
  return [
    LAND_TYPE.PLAINS,
    LAND_TYPE.MOUNTAINS,
    LAND_TYPE.GREEN_FOREST,
    LAND_TYPE.DARK_FOREST,
    LAND_TYPE.HILLS,
    LAND_TYPE.SWAMP,
    LAND_TYPE.DESERT,
  ];
};

export const getMainSpecialLandTypes = (): LAND_TYPE[] => {
  return [
    LAND_TYPE.VOLCANO,
    LAND_TYPE.SUN_SPIRE_PEAKS,
    LAND_TYPE.HEARTWOOD_COVE,
    LAND_TYPE.CRISTAL_BASIN,
    LAND_TYPE.SHADOW_MIRE,
  ];
};

export const getNearSpecialLandTypes = (id: LAND_TYPE): LAND_TYPE => {
  switch (id) {
    case LAND_TYPE.VOLCANO:
      return LAND_TYPE.LAVA;
    case LAND_TYPE.SUN_SPIRE_PEAKS:
      return LAND_TYPE.GOLDEN_PLAINS;
    case LAND_TYPE.HEARTWOOD_COVE:
      return LAND_TYPE.VERDANT_GLADE;
    case LAND_TYPE.CRISTAL_BASIN:
      return LAND_TYPE.MISTY_GLADES;
    case LAND_TYPE.SHADOW_MIRE:
      return LAND_TYPE.BLIGHTED_FEN;
    default:
      return LAND_TYPE.NONE;
  }
};

// common units which would be able to recruit on any land type
// some additional restriction could apply based on building and players alignment and type
const commonUnitsToRecruit: UnitType[] = [
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

export const getLandById = (id: LAND_TYPE): Land => {
  switch (id) {
    case LAND_TYPE.PLAINS:
      return {
        id: LAND_TYPE.PLAINS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 650, max: 1000 },
      };
    case LAND_TYPE.MOUNTAINS:
      return {
        id: LAND_TYPE.MOUNTAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.DWARF, HeroUnitType.HAMMER_LORD],
        goldPerTurn: { min: 900, max: 1150 },
      };
    case LAND_TYPE.GREEN_FOREST:
      return {
        id: LAND_TYPE.GREEN_FOREST,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 800, max: 950 },
      };
    case LAND_TYPE.DARK_FOREST:
      return {
        id: LAND_TYPE.DARK_FOREST,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.DARK_ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 800, max: 950 },
      };
    case LAND_TYPE.HILLS:
      return {
        id: LAND_TYPE.HILLS,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 500, max: 700 },
      };
    case LAND_TYPE.SWAMP:
      return {
        id: LAND_TYPE.SWAMP,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 350, max: 550 },
      };
    case LAND_TYPE.DESERT:
      return {
        id: LAND_TYPE.DESERT,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          HeroUnitType.FIGHTER,
          HeroUnitType.OGR,
          HeroUnitType.HAMMER_LORD,
          HeroUnitType.RANGER,
        ],
        goldPerTurn: { min: 150, max: 270 },
      };
    // special lands
    case LAND_TYPE.VOLCANO:
      return {
        id: LAND_TYPE.VOLCANO,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.LAVA:
      return {
        id: LAND_TYPE.LAVA,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.SUN_SPIRE_PEAKS:
      return {
        id: LAND_TYPE.SUN_SPIRE_PEAKS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.DWARF, HeroUnitType.HAMMER_LORD],
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.GOLDEN_PLAINS:
      return {
        id: LAND_TYPE.GOLDEN_PLAINS,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [
          ...commonUnitsToRecruit,
          RegularUnitType.DWARF,
          HeroUnitType.FIGHTER,
          RegularUnitType.WARRIOR,
        ],
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.HEARTWOOD_COVE:
      return {
        id: LAND_TYPE.HEARTWOOD_COVE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.VERDANT_GLADE:
      return {
        id: LAND_TYPE.VERDANT_GLADE,
        alignment: Alignment.LAWFUL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ELF, HeroUnitType.RANGER],
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.CRISTAL_BASIN:
      return {
        id: LAND_TYPE.CRISTAL_BASIN,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.MISTY_GLADES:
      return {
        id: LAND_TYPE.MISTY_GLADES,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.WARRIOR, HeroUnitType.FIGHTER],
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.SHADOW_MIRE:
      return {
        id: LAND_TYPE.SHADOW_MIRE,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.BLIGHTED_FEN:
      return {
        id: LAND_TYPE.BLIGHTED_FEN,
        alignment: Alignment.CHAOTIC,
        unitsToRecruit: [...commonUnitsToRecruit, RegularUnitType.ORC, HeroUnitType.OGR],
        goldPerTurn: { min: 500, max: 600 },
      };
    default:
      // used on map generation
      return {
        id: LAND_TYPE.NONE,
        alignment: Alignment.NEUTRAL,
        unitsToRecruit: [],
        goldPerTurn: { min: 0, max: 0 },
      };
  }
};
