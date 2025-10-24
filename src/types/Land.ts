import { Alignment } from './Alignment';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Lands

export enum LAND_TYPE {
  NONE = 'None',
  PLAINS = 'Plains',
  MOUNTAINS = 'Mountains',
  GREEN_FOREST = 'Green Forest',
  DARK_FOREST = 'Dark Forest',
  HILLS = 'Hills',
  SWAMP = 'Swamp',
  DESERT = 'Desert',
  // special lands
  LAVA = 'Lava',
  VOLCANO = 'Volcano',
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
  goldPerTurn: { min: number; max: number };
}

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
}

export const getSpecialLandTypes = (): LAND_TYPE[] => {
  return [
    LAND_TYPE.LAVA,
    LAND_TYPE.VOLCANO,
    LAND_TYPE.SUN_SPIRE_PEAKS,
    LAND_TYPE.GOLDEN_PLAINS,
    LAND_TYPE.HEARTWOOD_COVE,
    LAND_TYPE.VERDANT_GLADE,
    LAND_TYPE.CRISTAL_BASIN,
    LAND_TYPE.MISTY_GLADES,
  ]
}

export const getLandById = (id: LAND_TYPE): Land => {
  switch (id) {
    case LAND_TYPE.PLAINS:
      return {
        id: LAND_TYPE.PLAINS,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 650, max: 1000 },
      };
    case LAND_TYPE.MOUNTAINS:
      return {
        id: LAND_TYPE.MOUNTAINS,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 900, max: 1150 },
      };
    case LAND_TYPE.GREEN_FOREST:
      return {
        id: LAND_TYPE.GREEN_FOREST,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 800, max: 950 },
      };
    case LAND_TYPE.DARK_FOREST:
      return {
        id: LAND_TYPE.DARK_FOREST,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 800, max: 950 },
      };
    case LAND_TYPE.HILLS:
      return {
        id: LAND_TYPE.HILLS,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 500, max: 700 },
      };
    case LAND_TYPE.SWAMP:
      return {
        id: LAND_TYPE.SWAMP,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 350, max: 550 },
      };
    case LAND_TYPE.DESERT:
      return {
        id: LAND_TYPE.DESERT,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 150, max: 270 },
      };
    // special lands
    case LAND_TYPE.VOLCANO:
      return {
        id: LAND_TYPE.VOLCANO,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.LAVA:
      return {
        id: LAND_TYPE.LAVA,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.SUN_SPIRE_PEAKS:
      return {
        id: LAND_TYPE.SUN_SPIRE_PEAKS,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.GOLDEN_PLAINS:
      return {
        id: LAND_TYPE.SUN_SPIRE_PEAKS,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.HEARTWOOD_COVE:
      return {
        id: LAND_TYPE.HEARTWOOD_COVE,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.VERDANT_GLADE:
      return {
        id: LAND_TYPE.VERDANT_GLADE,
        alignment: Alignment.LAWFUL,
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.CRISTAL_BASIN:
      return {
        id: LAND_TYPE.CRISTAL_BASIN,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.MISTY_GLADES:
      return {
        id: LAND_TYPE.MISTY_GLADES,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 500, max: 600 },
      };
    case LAND_TYPE.SHADOW_MIRE:
      return {
        id: LAND_TYPE.SHADOW_MIRE,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 1000, max: 1000 },
      };
    case LAND_TYPE.BLIGHTED_FEN:
      return {
        id: LAND_TYPE.BLIGHTED_FEN,
        alignment: Alignment.CHAOTIC,
        goldPerTurn: { min: 500, max: 600 },
      };
    default:
      // use on map generation
      return {
        id: LAND_TYPE.NONE,
        alignment: Alignment.NEUTRAL,
        goldPerTurn: { min: 0, max: 0 },
      };
  }
};
