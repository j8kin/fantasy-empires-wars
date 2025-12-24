import { LandName } from '../../types/Land';
import type { LandType } from '../../types/Land';

/**
 * Returns the land types that surround a special land type
 * @returns Array of land types that can surround the given special land
 * @param landKind
 */
export const getSurroundingLands = (landKind: LandType): LandType[] => {
  switch (landKind) {
    case LandName.VOLCANO:
      return [LandName.MOUNTAINS, LandName.DARK_FOREST];
    case LandName.SUN_SPIRE_PEAKS:
      return [LandName.DARK_FOREST, LandName.HILLS];
    case LandName.HEARTWOOD_COVE:
      return [LandName.SWAMP, LandName.GREEN_FOREST];
    case LandName.CRISTAL_BASIN:
      return [LandName.DESERT, LandName.HILLS];
    case LandName.SHADOW_MIRE:
      return [LandName.PLAINS, LandName.SWAMP];
    default:
      return [];
  }
};

/**
 * Maps main special lands to their nearby counterpart lands
 * @param id - The main special land type
 * @returns The corresponding nearby special land type
 */
export const getNearSpecialLandKinds = (id: LandType): LandType => {
  switch (id) {
    case LandName.VOLCANO:
      return LandName.LAVA;
    case LandName.SUN_SPIRE_PEAKS:
      return LandName.GOLDEN_PLAINS;
    case LandName.HEARTWOOD_COVE:
      return LandName.VERDANT_GLADE;
    case LandName.CRISTAL_BASIN:
      return LandName.MISTY_GLADES;
    case LandName.SHADOW_MIRE:
      return LandName.BLIGHTED_FEN;
    default:
      return LandName.NONE;
  }
};

/**
 * Returns all special land types
 * @returns Array of special land types
 */
export const getSpecialLandKinds = (): LandType[] => [
  LandName.VOLCANO,
  LandName.LAVA,
  LandName.SUN_SPIRE_PEAKS,
  LandName.GOLDEN_PLAINS,
  LandName.HEARTWOOD_COVE,
  LandName.VERDANT_GLADE,
  LandName.CRISTAL_BASIN,
  LandName.MISTY_GLADES,
  LandName.SHADOW_MIRE,
  LandName.BLIGHTED_FEN,
];

/**
 * Returns all regular (non-special) land types
 * @returns Array of regular land types
 */
export const getRegularLandKinds = (): LandType[] => {
  return [
    LandName.PLAINS,
    LandName.MOUNTAINS,
    LandName.GREEN_FOREST,
    LandName.DARK_FOREST,
    LandName.HILLS,
    LandName.SWAMP,
    LandName.DESERT,
  ];
};

/**
 * Returns the main special land types (primary special lands)
 * @returns Array of main special land types
 */
export const getMainSpecialLandKinds = (): LandType[] => {
  return [
    LandName.VOLCANO,
    LandName.SUN_SPIRE_PEAKS,
    LandName.HEARTWOOD_COVE,
    LandName.CRISTAL_BASIN,
    LandName.SHADOW_MIRE,
  ];
};
